
import mongoose from "mongoose";

  const videoSchema = new mongoose.Schema({
    title: String,
    artist: String,
    language: String,
    category: String,
  });
  
  const video = mongoose.model('video', videoSchema); // 'Song' is the model name
  
  export default video;

  // video.model.ts
export interface Video {
  id: string;  
  title: string;  
  url: string;  
  duration: number; 
}

 