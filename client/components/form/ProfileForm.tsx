'use client';
import React, { useState } from 'react';

interface ProfileFormProps {
  initialDisplayName: string;
  onSubmit: (formData: FormDataType) => void;
}

export interface FormDataType {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ initialDisplayName, onSubmit }) => {
  const [formData, setFormData] = useState<FormDataType>({
    firstName: initialDisplayName || '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {[
        { label: 'ชื่อ', name: 'firstName', type: 'text' },
        { label: 'นามสกุล', name: 'lastName', type: 'text' },
        // { label: 'อีเมล', name: 'email', type: 'email' },
        // { label: 'เบอร์โทรศัพท์', name: 'phone', type: 'tel' },
        // { label: 'แผนก/ฝ่าย', name: 'department', type: 'text' },
      ].map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium text-gray-700">{field.label}</label>
          <input
            type={field.type}
            name={field.name}
            value={(formData as any)[field.name]}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
      ))}
      <div className="pt-2">
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
        >
          บันทึกข้อมูล
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
