import React, { useState } from 'react';

const ImageComponent = ({ src, alt, className }) => {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    console.error(`Failed to load image: ${src}`);
    setIsError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    console.log(`Successfully loaded image: ${src}`);
    setIsLoading(false);
  };

  if (isError) {
    return <div className={`${className} bg-gray-200 flex items-center justify-center`}>
      <span className="text-gray-500">Image not available</span>
    </div>;
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={`${className} bg-gray-100 animate-pulse`} />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'invisible' : 'visible'}`}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  );
};

export default ImageComponent;
