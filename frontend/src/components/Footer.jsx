import React from 'react';

export default function Footer(){
  return (
    <footer className="mt-12 py-6 bg-white border-t">
      <div className="container mx-auto text-center text-sm text-gray-500">
        <div>© {new Date().getFullYear()} Wellness Board — Built with care</div>
        <div className="mt-2 subtle">Made for healthier habits • <a className="text-brand" href="#">Contact</a></div>
      </div>
    </footer>
  );
}
