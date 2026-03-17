'use client';

import React from 'react';
import { ContactPageEditor } from '@/components/admin/pages/ContactPageEditor';

const ContactAdminPage = () => {
  return (
    <div className="container mx-auto py-6">
      <ContactPageEditor 
        slug="contact"
        onSave={async (data) => {
        }}
        onPreview={(data) => {
        }}
      />
    </div>
  );
};

export default ContactAdminPage;