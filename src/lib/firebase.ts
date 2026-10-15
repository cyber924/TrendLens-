"use client";

// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZPIjIIJMb2dxBm39KYE_PSCEtYrPGp2I",
  authDomain: "trendlens-ai-3wqa7.firebaseapp.com",
  projectId: "trendlens-ai-3wqa7",
  storageBucket: "trendlens-ai-3wqa7.firebasestorage.app",
  messagingSenderId: "37297211260",
  appId: "1:37297211260:web:46a8a62419abeb3f2ec6f9"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };

    