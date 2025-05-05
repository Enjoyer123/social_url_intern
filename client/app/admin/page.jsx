"use client"

import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

// Import shadcn components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from "@/components/ui/progress"

export default function AdminDashboard() {
  const [rounds, setRounds] = useState([]);
  const [selectedRound, setSelectedRound] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    console.log("admin")
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch access links
      const linksResponse = await axios.get('http://localhost:8000/user/access-links');
      console.log("linksResponse",linksResponse)
      const links = linksResponse.data;
      
      // Fetch current round
      const roundResponse = await axios.get('http://localhost:8000/user/current-round');
      console.log("roundResponse",roundResponse)
      const currentRound = roundResponse.data.currentRound;
      
      // Group links by round
      const groupedLinks = groupLinksByRound(links, currentRound);
      setRounds(groupedLinks);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to group links by round
  const groupLinksByRound = (links, currentRound) => {
    // Group by month for this example (in real app you might group by round_id)
    const groupedByMonth = {};
    
    links.forEach(link => {
      const date = new Date(link.start_time);
      const monthYear = `${date.getMonth() + 1}-${date.getFullYear()}`;
      
      if (!groupedByMonth[monthYear]) {
        groupedByMonth[monthYear] = {
          id: monthYear,
          name: `รอบ ${format(date, 'MMMM yyyy', { locale: th })}`,
          links: [],
          startDate: new Date(link.start_time),
          isCurrentRound: false // Add flag for current round
        };
      }
      
      groupedByMonth[monthYear].links.push(link);
    });
    
    // Convert to array and sort by date
    const rounds = Object.values(groupedByMonth).sort((a, b) => b.startDate - a.startDate);
    
    return rounds;
  };
  
  const openModal = (round) => {
    setSelectedRound(round);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  // Start new round
  const startNewRound = async () => {
    try {
      await axios.post('http://localhost:8000/user/new-round');
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error starting new round:', error);
    }
  };
  
  // Function to calculate status
  const getRoundStatus = (round) => {
    const now = new Date();
    const activeLinks = round.links.filter(link => {
      const startTime = new Date(link.start_time);
      const endTime = new Date(link.end_time);
      return startTime <= now && endTime >= now;
    });
    
    if (activeLinks.length > 0) return 'active';
    
    const latestEndTime = new Date(Math.max(...round.links.map(l => new Date(l.end_time))));
    if (latestEndTime < now) return 'completed';
    
    return 'upcoming';
  };
  
  const getStatusBadgeVariant = (status) => {
    switch(status) {
      case 'active': return 'success';
      case 'completed': return 'secondary';
      case 'upcoming': return 'primary';
      default: return 'secondary';
    }
  };
  
  const getStatusText = (status) => {
    switch(status) {
      case 'active': return 'กำลังดำเนินการ';
      case 'completed': return 'เสร็จสิ้น';
      case 'upcoming': return 'กำลังจะมาถึง';
      default: return 'ไม่ระบุ';
    }
  };
  
  const getLinkStatusBadgeVariant = (link) => {
    const now = new Date();
    const startTime = new Date(link.start_time);
    const endTime = new Date(link.end_time);
    
    if (link.is_used) return 'success';
    if (now > endTime) return 'destructive';
    if (now < startTime) return 'warning';
    return 'primary';
  };
  
  const getLinkStatusText = (link) => {
    const now = new Date();
    const startTime = new Date(link.start_time);
    const endTime = new Date(link.end_time);
    
    if (link.is_used) return 'ใช้งานแล้ว';
    if (now > endTime) return 'หมดอายุ';
    if (now < startTime) return 'รอเวลา';
    return 'พร้อมใช้งาน';
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ระบบจัดการลิงก์เฉพาะ</h1>
          <div className="flex gap-2">
            <Button onClick={startNewRound} variant="outline">
              เริ่มรอบใหม่
            </Button>
            <Button asChild>
              <a href="/admin/addround">เพิ่มรอบงานใหม่</a>
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Progress className="h-12 w-12 text-indigo-600" />
          </div>
        ) : rounds.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-500">ไม่พบข้อมูลรอบงาน</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rounds.map((round) => {
              const status = getRoundStatus(round);
              return (
                <Card 
                  key={round.id} 
                  className="cursor-pointer transform transition-all duration-300 hover:shadow-lg"
                  onClick={() => openModal(round)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>{round.name}</CardTitle>
                      <Badge variant={getStatusBadgeVariant(status)}>
                        {getStatusText(status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-500">
                      จำนวนลิงก์: <span className="font-medium text-gray-900">{round.links.length}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/admin/manage-round/${round.id}`;
                      }}
                    >
                      จัดการ
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Detail Modal using shadcn Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        {selectedRound && (
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedRound.name}</DialogTitle>
            </DialogHeader>
            
            <div className="mt-4">
              <h4 className="text-lg font-medium text-gray-900 mb-2">รายละเอียดลิงก์</h4>
              
              <div className="overflow-x-auto mt-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ชื่อผู้ใช้</TableHead>
                      <TableHead>เวลาเริ่มต้น</TableHead>
                      <TableHead>เวลาสิ้นสุด</TableHead>
                      <TableHead>สถานะ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedRound.links.map((link) => (
                      <TableRow key={link.id}>
                        <TableCell className="font-medium">{link.staff_name}</TableCell>
                        <TableCell>
                          {format(new Date(link.start_time), 'd MMM yyyy HH:mm', { locale: th })}
                        </TableCell>
                        <TableCell>
                          {format(new Date(link.end_time), 'd MMM yyyy HH:mm', { locale: th })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getLinkStatusBadgeVariant(link)}>
                            {getLinkStatusText(link)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                onClick={() => {
                  window.location.href = `/admin/addlink?roundId=${selectedRound.id}`;
                }}
              >
                เพิ่มลิงก์
              </Button>
              <Button variant="outline" onClick={closeModal}>
                ปิด
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}