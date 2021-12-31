import * as React from 'react';
import { FileUpload } from '~/components/_common/FileUpload';

export const Upload: React.FC = function Upload() {
  return (
    <div className="grid grid-cols-4">
      <FileUpload apiRoute="/users/create-many" title="USERS" />
    </div>
  );
}