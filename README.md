# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Media Provider (Cloudinary)

This project uses:

- Cloudinary for responsive image delivery (`src/components/media/ResponsiveImage.js`)
- Runtime folder gallery loading directly from Cloudinary list endpoints
- Optional proxy API fallback for private/locked-down Cloudinary setups

Create a `.env` file in the project root with:

```bash
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_CLOUDINARY_API_BASE_URL=https://your-backend.example.com/api

# Optional mp4 URLs for project videos
REACT_APP_BOTTEGA_VIDEO_MP4=https://your-cdn/video.mp4
REACT_APP_SELECT_VIDEO_MP4=https://your-cdn/video.mp4

# Optional: only needed if Cloudinary list endpoint is restricted
REACT_APP_CLOUDINARY_GALLERY_API_URL=https://your-api.example.com/cloudinary/gallery

# Optional: logs each Cloudinary/gallery request in browser console
REACT_APP_CLOUDINARY_DEBUG=true
```

Cloudinary public IDs are mapped in `src/data/imageData.js`.

Project media definitions and folder mappings are in `src/data/projects.js`.

`REACT_APP_CLOUDINARY_GALLERY_API_URL` is optional and only used as a fallback when direct list requests are not available.

For direct folder pulling, ensure your Cloudinary account allows public list access for the folders/images you expect to render.

## Cloudinary Backend API

This repo now includes serverless backend handlers for authenticated Cloudinary Admin API access:

1. `api/cloudinary/health.js` verifies deployment and env presence.
1. `api/cloudinary/folders.js` lists folders.
1. `api/cloudinary/gallery.js` returns all `publicIds` for one folder.

Backend environment variables:

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_admin_api_key
CLOUDINARY_API_SECRET=your_admin_api_secret
```

Example endpoints:

1. `GET /api/cloudinary/health`
1. `GET /api/cloudinary/folders?prefix=ek/creativedir`
1. `GET /api/cloudinary/gallery?folderPath=ek/creativedir/powerade`

Frontend hooks:

1. `useProjectGallery(project)` in `src/hooks/useProjectGallery.js` loads media for a project folder and maps discovered `publicIds` to carousel items.
2. `useCloudinaryFolders({ prefix })` in `src/hooks/useCloudinaryFolders.js` loads the folder index for dynamic project/folder matching.

## Vercel Full-Stack Deployment

This repo is configured for full-stack Vercel deployment:

1. Frontend: Create React App static build from `build/`.
2. Backend: serverless functions from `api/`.

Deploy steps:

1. Import this repo into Vercel.
2. Keep the project root at the repository root.
3. Add Vercel environment variables:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
4. Deploy.
5. Verify frontend and API:
   - `/`
   - `/api/cloudinary/health`
   - `/api/cloudinary/folders?prefix=ek/creativedir`
6. Set frontend API base URL for production to same-origin API:
   - `REACT_APP_CLOUDINARY_API_BASE_URL=/api`

SPA routing is handled by `vercel.json` so deep links resolve to `index.html`.

## Inspect Cloudinary Calls

To see everything called from Cloudinary/gallery sources:

1. Open browser dev tools -> Network.
2. Filter by `res.cloudinary.com` or your proxy URL.
3. In Console, run `window.__cloudinaryApiCallLog()` to see request history 2. Keep the project root at the repository root.(source, folderPath, status, count, timestamp).
4. Run `window.__clearCloudinaryApiCallLog()` to reset the history.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
