'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

/**
 * Componente de imagem otimizado que utiliza next/image para melhorar o desempenho
 * Implementa lazy loading e otimização automática de imagens
 */
export default function OptimizedImage({
  src,
  alt,
  width = 0,
  height = 0,
  className = '',
  priority = false
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [imgDimensions, setImgDimensions] = useState({ width, height });
  
  // Detecta se a imagem é local ou externa
  const isLocalImage = !src.startsWith('http') && !src.startsWith('data:');
  
  // Efeito para carregar dimensões da imagem se não fornecidas
  useEffect(() => {
    if ((width === 0 || height === 0) && isLocalImage) {
      // Para imagens locais, podemos definir dimensões padrão
      setImgDimensions({
        width: width || 300,
        height: height || 200
      });
    }
    
    // Atualiza a fonte da imagem quando a prop src mudar
    setImgSrc(src);
  }, [src, width, height, isLocalImage]);
  
  // Manipulador de erro para fallback
  const handleError = () => {
    // Fallback para uma imagem de placeholder se a imagem original falhar
    setImgSrc('/assets/placeholder.png');
  };
  
  // Para imagens externas, usamos um componente de imagem padrão com lazy loading
  if (!isLocalImage) {
    return (
      <img 
        src={imgSrc}
        alt={alt}
        width={imgDimensions.width || undefined}
        height={imgDimensions.height || undefined}
        className={className}
        loading="lazy"
        onError={handleError}
      />
    );
  }
  
  // Para imagens locais, usamos o componente Image do Next.js para otimização
  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={imgDimensions.width}
      height={imgDimensions.height}
      className={className}
      priority={priority}
      quality={80} // Qualidade de 80% oferece bom equilíbrio entre tamanho e qualidade
      onError={handleError}
    />
  );
}