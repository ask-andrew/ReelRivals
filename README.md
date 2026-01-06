<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1UfKqVA_ozGwBzrnm0n_9ROqyqf6-qQtz

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Netlify

1. Install the Netlify CLI:
   `npm install -g netlify-cli`
2. Login to Netlify:
   `netlify login`
3. Deploy the app:
   `netlify deploy --prod`

## Deployed Application

You can access the deployed application at the following URL:

[https://reelrivals.netlify.app/](https://reelrivals.netlify.app/)
