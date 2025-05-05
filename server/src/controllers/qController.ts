import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto'
const prisma = new PrismaClient();

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.users.findMany({
            orderBy: { position_id: 'asc' },
        });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const getNextStaff = async (req: Request, res: Response) => {
    try {
        const status = await prisma.queue_status.findFirst();

        if (!status){
            
            res.status(404).json({ error: 'Queue status not found' });
            return 
        } 
            
        res.status(404).json({ error: 'Queue status not found' });

        const lastAssignedId = status.last_assigned_user_id;

        const users = await prisma.users.findMany({ orderBy: { position_id: 'asc' } });

        if (!lastAssignedId) {
            
            res.json(users[0]);
            return
        }
            

        const lastUserIndex = users.findIndex(user => user.id === lastAssignedId);
        const nextUser = users[(lastUserIndex + 1) % users.length];

        res.json(nextUser);
    } catch (error) {
        console.error('Error fetching next staff:', error);
        res.status(500).json({ error: 'Failed to fetch next staff' });
    }
};


export const getTasks = async (req: Request, res: Response) => {
    try {
        const tasks = await prisma.tasks.findMany({
            include: { users: { select: { name: true } } },
            orderBy: [{ round_id: 'asc' }, { id: 'asc' }],
        });
        res.json(tasks.map(task => ({
            ...task,
            user_name: task.users?.name,
        })));
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};

export const createTasks = async (req: Request, res: Response) => {
    try {
        const { tasks } = req.body;
        if (!tasks || !Array.isArray(tasks)) {

            res.status(400).json({ error: 'Invalid task list' });
            return
        } 

        const status = await prisma.queue_status.findFirst();
        if (!status) {
            res.status(404).json({ error: 'Queue status not found' });
            return 

        }

        const users = await prisma.users.findMany({ orderBy: { position_id: 'asc' } });
        let lastIndex = users.findIndex(u => u.id === status.last_assigned_user_id);

        const newTasks = [];

        for (const description of tasks) {
            lastIndex = (lastIndex + 1) % users.length;
            const assignedUser = users[lastIndex];

            const newTask = await prisma.tasks.create({
                data: {
                    description,
                    user_id: assignedUser.id,
                    round_id: status.last_round_id,
                    created_at: new Date(),
                },
                include: { users: { select: { name: true } } },
            });

            newTasks.push({
                ...newTask,
                user_name: newTask.users?.name,
            });

            // update last assigned
            await prisma.queue_status.update({
                where: { id: status.id },
                data: {
                    last_assigned_user_id: assignedUser.id,
                    updated_at: new Date(),
                },
            });
        }

        res.status(201).json(newTasks);
    } catch (error) {
        console.error('Error adding tasks:', error);
        res.status(500).json({ error: 'Failed to add tasks' });
    }
};

export const getCurrentRound = async (req: Request, res: Response) => {
    try {
        const status = await prisma.queue_status.findFirst();
        if (!status)
            {

             res.status(404).json({ error: 'Queue status not found' });
             return
            } 
        res.json({ currentRound: status.last_round_id });
    } catch (error) {
        console.error('Error fetching round:', error);
        res.status(500).json({ error: 'Failed to fetch round' });
    }
};

export const startNewRound = async (req: Request, res: Response) => {
    try {
        const status = await prisma.queue_status.findFirst();
        if (!status) {
             res.status(404).json({ error: 'Queue status not found' });
             return
        }

        const newRound = status.last_round_id + 1;
        await prisma.queue_status.update({
            where: { id: status.id },
            data: {
                last_round_id: newRound,
                updated_at: new Date(),
            },
        });

        res.json({ success: true, newRoundId: newRound });
    } catch (error) {
        console.error('Error starting round:', error);
        res.status(500).json({ error: 'Failed to start round' });
    }
};

function generateAccessToken() {
    return crypto.randomBytes(16).toString('hex');
}

export const createAccessLink = async (req: Request, res: Response) => {
    try {
        const { suspectUrl, staffId, startTime, endTime } = req.body;

        console.log(req.body)

        if (!staffId || !startTime || !endTime || !suspectUrl) {
            
            res.status(400).json({ error: 'Invalid input' });
            return
        }

        console.log("test",parseInt(staffId, 10))

        const staff = await prisma.users.findUnique({ where: {  id: parseInt(staffId, 10)  } });
        if (!staff) {
           res.status(404).json({ error: 'Staff not found' });
           return 
        }

        const token = generateAccessToken();

        const newLink = await prisma.access_links.create({
            data: {
                user_id: staffId,
                submitted_url: suspectUrl,
                access_token: token,
                start_time: new Date(startTime),
                end_time: new Date(endTime),
            },
            include: { users: { select: { name: true } } },
        });

        res.status(201).json({
            ...newLink,
            staff_name: newLink.users?.name,
            url: `/addnew/${token}`,
        });
    } catch (error) {
        console.error('Error creating access link:', error);
        res.status(500).json({ error: 'Failed to create access link' });
    }
};

export const getAccessLinks = async (_req: Request, res: Response) => {
    try {
        const links = await prisma.access_links.findMany({
            orderBy: { created_at: 'desc' },
            include: { users: { select: { name: true } } },
        });

        res.json(
            links.map(link => ({
                ...link,
                staff_name: link.users?.name,
                url: `/add/${link.access_token}`,
            }))
        );
    } catch (error) {
        console.error('Error fetching access links:', error);
        res.status(500).json({ error: 'Failed to fetch access links' });
    }
};