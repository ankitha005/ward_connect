import { createRepo, uploadFiles } from '@huggingface/hub';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.HF_TOKEN;
if (!token) {
    console.error("No HF_TOKEN found in .env");
    process.exit(1);
}

async function main() {
    try {
        const whoamiRes = await fetch('https://huggingface.co/api/whoami-v2', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const whoami = await whoamiRes.json();
        const username = whoami.name;
        
        if (!username) {
            throw new Error("Could not fetch username from token");
        }

        const randomStr = Math.random().toString(36).substring(2, 8);
        const repoName = `${username}/yolov5-demo-${randomStr}`;

        console.log(`Creating Space: ${repoName}...`);
        
        const createRes = await createRepo({
            repo: { type: 'space', name: repoName },
            credentials: { accessToken: token },
            info: { private: false }
        });

        console.log(`Space created at: ${createRes.repoUrl}`);

        const readmeContent = `---
title: YOLOv5 Image Recognition
emoji: 🚀
colorFrom: blue
colorTo: purple
sdk: gradio
sdk_version: 5.9.1
app_file: app.py
pinned: false
---

# YOLOv5 Image Recognition Demo
This Space hosts a demo for the YOLOv5 model trained for NTU MDP.
`;

        const appContent = `import gradio as gr
gr.load("models/pyesonekyaw/MDP_ImageRecognition_YOLOv5_Week_9_AY22-23_NTU-SG").launch()
`;

        console.log("Uploading files...");

        await uploadFiles({
            repo: { type: 'space', name: repoName },
            credentials: { accessToken: token },
            files: [
                {
                    path: 'README.md',
                    content: new Blob([readmeContent], { type: 'text/markdown' })
                },
                {
                    path: 'app.py',
                    content: new Blob([appContent], { type: 'text/x-python' })
                }
            ],
            commitTitle: "Initial commit with Gradio app"
        });

        console.log(`Upload complete! Your space is live at: ${createRes.repoUrl}`);
    } catch (e) {
        console.error("Error creating space:", e);
    }
}

main();
