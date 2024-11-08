'use client';
import React from 'react';
import "../global.css";

const founders = [
  {
    name: "Yatharth N. Chawhan",
    role: "Founder",
    email: "yatharthchawhan23@gmail.com",
    phone: "+91 7709345096",
    description: "An Electronics and Telecommunication graduate from WIT Solapur with a passion for technology and education.",
    image: "mypfp.jpg", // Replace with the actual path to the image
    linkedin: "https://www.linkedin.com/in/yatharth-chawhan-6b3918236/", // LinkedIn profile URL
  },
  {
    name: "Shruti Mohole",
    role: "Co-founder",
    email: "moholeshruti17@gmail.com",
    phone: "+91 7841922648",
    description: "Electronics and Telecommunication graduate from WIT Solapur, dedicated to building innovative solutions for education.",
    image: "pfpshruti.jpg", // Replace with the actual path to the image
    linkedin: "https://www.linkedin.com/in/shruti-mohole-23a643233?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app", // LinkedIn profile URL
  },
  {
    name: "Akshay Doshi",
    role: "Co-founder",
    email: "Akshaydoshi453@gmail.com",
    phone: "+91 9697950707",
    description: "Graduated from WIT Solapur in Electronics and Telecommunication, committed to making education more accessible.",
    image: "pfpakshay.jpg", // Replace with the actual path to the image
    linkedin: "http://www.linkedin.com/in/akshay-doshi-4b1760234", // LinkedIn profile URL
  },
];

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-gray-200 p-6 flex flex-col items-center">
      <h1 className="text-5xl font-bold text-yellow-400 mt-10 mb-4">About Us</h1>
      <p className="text-lg text-center max-w-2xl mb-10">
        We are a team of Electronics and Telecommunication graduates from WIT Solapur, dedicated to transforming education with interactive, engaging platforms. Our mission is to make learning accessible and enjoyable for everyone.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
        {founders.map((founder, index) => (
          <div
            key={index}
            className="bg-gray-800 bg-opacity-80 rounded-lg p-6 text-center shadow-lg transform transition duration-300 hover:scale-105"
          >
            <div className="mb-4">
              <img
                src={founder.image}
                alt={`${founder.name}'s profile`}
                className="w-24 h-24 rounded-full mx-auto object-cover shadow-md"
              />
            </div>
            {/* LinkedIn clickable name */}
            <a 
              href={founder.linkedin} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-2xl font-semibold text-purple-300 mb-1 hover:text-yellow-500"
            >
              {founder.name}
            </a>
            <p className="text-lg font-medium text-yellow-500 mb-3">{founder.role}</p>
            <p className="text-gray-400 mb-4">{founder.description}</p>
            <div className="text-sm">
              <p className="mb-1">
                <span className="font-semibold text-purple-400">Email:</span> {founder.email}
              </p>
              <p>
                <span className="font-semibold text-purple-400">Phone:</span> {founder.phone}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
