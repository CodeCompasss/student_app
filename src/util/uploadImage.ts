import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
   import { storage } from "@/lib/firebase/config";

   export async function uploadImage(file: File): Promise<string> {
     const storageRef = ref(storage, `images/${file.name}`);
     await uploadBytes(storageRef, file);
     return getDownloadURL(storageRef);
   }