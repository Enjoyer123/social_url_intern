"use client"

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { format } from 'date-fns';

// Import shadcn components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';

export default function AddLink() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roundId = searchParams.get('roundId');
  
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [suspectUrl, setSuspectUrl] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7); // Default to 7 days from now
    return date;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    console.log("useef")
   
       
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/user/users');
      console.log("user",response)
      setUsers(response.data);
      if (response.data.length > 0) {
        setSelectedUserId(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('ไม่สามารถดึงข้อมูลเจ้าหน้าที่ได้');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    console.log("selectedUserId",selectedUserId)
    if (!selectedUserId || !suspectUrl) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    if (!suspectUrl.startsWith('http://') && !suspectUrl.startsWith('https://')) {
      setError('URL ต้องขึ้นต้นด้วย http:// หรือ https://');
      return;
    }
    
    if (startDate >= endDate) {
      setError('วันที่สิ้นสุดต้องมากกว่าวันที่เริ่มต้น');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await axios.post('http://localhost:8000/user/access-links', {
        staffId: parseInt(selectedUserId),
        suspectUrl: suspectUrl,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString()
      });
      
      setSuccess('สร้างลิงก์สำเร็จ');
      setSuspectUrl('');
      
      // Wait a bit before redirecting
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating access link:', error);
      setError('ไม่สามารถสร้างลิงก์ได้');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">เพิ่มลิงก์เฉพาะ</CardTitle>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="user">เจ้าหน้าที่</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger id="user">
                    <SelectValue placeholder="เลือกเจ้าหน้าที่" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="suspectUrl">URL ที่ต้องการให้เจ้าหน้าที่ตรวจสอบ</Label>
                <Input
                  id="suspectUrl"
                  type="text"
                  placeholder="https://example.com"
                  value={suspectUrl}
                  onChange={(e) => setSuspectUrl(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>วันที่เริ่มต้น</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(startDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>วันที่สิ้นสุด</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(endDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/admin/dashboard')}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'กำลังสร้าง...' : 'สร้างลิงก์'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}