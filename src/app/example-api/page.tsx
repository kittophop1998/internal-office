'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/api/useUsers';
import type { CreateUserDto, UpdateUserDto } from '@/services/api/example-user.service';

/**
 * หน้าตัวอย่างการใช้งาน React Query กับ API
 * แสดงวิธีการ CRUD ข้อมูลด้วย custom hooks
 */
export default function ExampleApiPage() {
  const [page, setPage] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  
  // Form states
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');

  // Query: ดึงรายการ users
  const { data, isLoading, error } = useUsers(
    { page, limit: 10 },
    {
      staleTime: 1000 * 60, // 1 นาที
      // refetchInterval: 5000, // refetch ทุก 5 วินาที
    }
  );

  // Mutation: สร้าง user ใหม่
  const createUserMutation = useCreateUser();

  // Mutation: แก้ไข user
  const updateUserMutation = useUpdateUser();

  // Mutation: ลบ user
  const deleteUserMutation = useDeleteUser();

  // Handle สร้าง user
  const handleCreateUser = () => {
    const userData: CreateUserDto = {
      name: newUserName,
      email: newUserEmail,
      password: newUserPassword,
    };

    createUserMutation.mutate(userData, {
      onSuccess: () => {
        setCreateDialogOpen(false);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        alert('สร้าง user สำเร็จ!');
      },
      onError: (error) => {
        alert(`เกิดข้อผิดพลาด: ${error.message}`);
      },
    });
  };

  // Handle แก้ไข user
  const handleUpdateUser = () => {
    if (!editingUserId) return;

    const userData: UpdateUserDto = {
      name: editUserName,
      email: editUserEmail,
    };

    updateUserMutation.mutate(
      { id: editingUserId, data: userData },
      {
        onSuccess: () => {
          setEditDialogOpen(false);
          setEditingUserId(null);
          setEditUserName('');
          setEditUserEmail('');
          alert('แก้ไข user สำเร็จ!');
        },
        onError: (error) => {
          alert(`เกิดข้อผิดพลาด: ${error.message}`);
        },
      }
    );
  };

  // Handle ลบ user
  const handleDeleteUser = (id: number) => {
    if (!confirm('คุณต้องการลบ user นี้ใช่หรือไม่?')) return;

    deleteUserMutation.mutate(id, {
      onSuccess: () => {
        alert('ลบ user สำเร็จ!');
      },
      onError: (error) => {
        alert(`เกิดข้อผิดพลาด: ${error.message}`);
      },
    });
  };

  // เปิด dialog แก้ไข
  const handleOpenEditDialog = (userId: number, name: string, email: string) => {
    setEditingUserId(userId);
    setEditUserName(name);
    setEditUserEmail(email);
    setEditDialogOpen(true);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        ตัวอย่างการใช้งาน React Query
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        ตัวอย่างการ call API ด้วย @tanstack/react-query พร้อม Custom Hooks
      </Typography>

      {/* ปุ่มสร้าง user ใหม่ */}
      <Button
        variant="contained"
        color="primary"
        onClick={() => setCreateDialogOpen(true)}
        sx={{ mb: 3 }}
      >
        สร้าง User ใหม่
      </Button>

      {/* แสดง loading state */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* แสดง error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message}
        </Alert>
      )}

      {/* แสดงรายการ users */}
      {data && (
        <>
          <Typography variant="h6" gutterBottom>
            รายการ Users (ทั้งหมด {data.total} คน)
          </Typography>

          <Stack spacing={2} sx={{ mb: 3 }}>
            {data.data.map((user) => (
              <Card key={user.id}>
                <CardContent>
                  <Typography variant="h6">{user.name}</Typography>
                  <Typography color="text.secondary">{user.email}</Typography>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleOpenEditDialog(user.id, user.name, user.email)}
                      sx={{ mr: 1 }}
                    >
                      แก้ไข
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={deleteUserMutation.isPending}
                    >
                      ลบ
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ก่อนหน้า
            </Button>
            <Typography sx={{ py: 1 }}>
              หน้า {data.page} / {data.totalPages}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= data.totalPages}
            >
              ถัดไป
            </Button>
          </Box>
        </>
      )}

      {/* Dialog สร้าง user */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>สร้าง User ใหม่</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="ชื่อ"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="อีเมล"
            type="email"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="รหัสผ่าน"
            type="password"
            value={newUserPassword}
            onChange={(e) => setNewUserPassword(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>ยกเลิก</Button>
          <Button
            onClick={handleCreateUser}
            variant="contained"
            disabled={createUserMutation.isPending}
          >
            {createUserMutation.isPending ? 'กำลังสร้าง...' : 'สร้าง'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog แก้ไข user */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>แก้ไข User</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="ชื่อ"
            value={editUserName}
            onChange={(e) => setEditUserName(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="อีเมล"
            type="email"
            value={editUserEmail}
            onChange={(e) => setEditUserEmail(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>ยกเลิก</Button>
          <Button
            onClick={handleUpdateUser}
            variant="contained"
            disabled={updateUserMutation.isPending}
          >
            {updateUserMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
