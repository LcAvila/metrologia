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
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  accept?: string;
  multiple?: boolean;
}

export default function InputFileUpload({ onChange, name, accept, multiple = false }: InputFileUploadProps) {
  return (
    <Button
      component="label"
      role={undefined}
      variant="contained"
      tabIndex={-1}
      startIcon={<CloudUploadIcon />}
      sx={{ textTransform: 'none' }} // Para manter o texto como "Upload file"
    >
      Upload file
      <VisuallyHiddenInput
        type="file"
        name={name}
        onChange={onChange}
        accept={accept}
        multiple={multiple}
      />
    </Button>
  );
}