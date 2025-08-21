'use client';

import React from 'react';
import { ContactPageEditor } from '@/components/admin/pages/ContactPageEditor';

const ContactAdminPage = () => {
  return (
    <div className="container mx-auto py-6">
      <ContactPageEditor 
        slug="contact"
        onSave={async (data) => {
          console.log('Saving contact data:', data);
        }}
        onPreview={(data) => {
          console.log('Previewing contact data:', data);
        }}
      />
    </div>
  );
};

export default ContactAdminPage;