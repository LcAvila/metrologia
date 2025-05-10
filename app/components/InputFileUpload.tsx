import * as React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

interface InputFileUploadProps {
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFileChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  accept?: string;
  multiple?: boolean;
  label?: string;
  icon?: React.ReactElement;
  fileName?: string;
  currentFileUrl?: string;
}

export default function InputFileUpload({ onChange, onFileChange, name, accept, multiple = false, label = "Upload file", icon, fileName, currentFileUrl }: InputFileUploadProps) {
  return (
    <>
      <Button
        component="label"
        role={undefined}
        variant="contained"
        tabIndex={-1}
        startIcon={icon ?? <CloudUploadIcon />}
        sx={{ textTransform: 'none' }} // Para manter o texto como "Upload file"
      >
        {label}
        <VisuallyHiddenInput
          type="file"
          name={name}
          onChange={onFileChange ?? onChange}
          accept={accept}
          multiple={multiple}
        />
      </Button>
      {fileName && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#555' }}>{fileName}</div>
      )}
      {currentFileUrl && (
        <div style={{ marginTop: 4 }}>
          <a href={currentFileUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', fontSize: 12 }}>
            Visualizar arquivo atual
          </a>
        </div>
      )}
    </>
  );
}