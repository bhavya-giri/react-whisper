const formidable = require("formidable");
import { Client, Storage, ID } from "appwrite";

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("65311885187eccf6ee74");
const storage = new Storage(client);

export const config = {
  api: {
    bodyParser: false, // Disabling Next.js's body parser to use formidable
  },
};

export default async function handler(req, res) {
  console.log(req);
  if (req.method === "POST") {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: "Error parsing the form." });
      }

      // Check if the audio file exists in the files object
      if (!files.audio) {
        return res.status(400).json({ error: "No audio file uploaded." });
      }

      const audioFile = files.audio;

      console.log(audioFile);
      try {
        const response = await storage.createFile(
          "65311898f1994ac927ae", // Bucket ID
          ID.unique(), // File ID
          audioFile.path, // Path to the uploaded audio file
          "audio/webm", // Assuming the mime type of your file is audio/webm, adjust if different
          ["*"], // Read permissions: '*' means everyone can read
          ["*"] // Write permissions: '*' means everyone can write (adjust as per your requirements)
        );

        // Once the audio is uploaded to Appwrite, you can get its URL.
        const audioUrl = storage.getFileView(
          "65311898f1994ac927ae",
          response.$id
        );
        console.log(audioUrl);

        res.status(200).json({
          message: "Audio uploaded successfully!",
          audioUrl: audioUrl.href,
        });
      } catch (error) {
        console.error("Error uploading the audio to Appwrite:", error.message);
        res.status(500).json({ error: "Error uploading the audio." });
      }
    });
  } else {
    res.status(405).json({ message: "Method not allowed." });
  }
}
