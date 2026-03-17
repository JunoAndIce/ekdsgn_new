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
- Server-side automatic project generation from Cloudinary Admin API folders

Create a `.env` file in the project root with:

```bash
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name

# Server-only Cloudinary Admin credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET_BASE64=your_base64_encoded_api_secret

# Optional: limit auto-discovery to a Cloudinary folder prefix
CLOUDINARY_PROJECTS_PREFIX=ek

# Optional: include empty folders as projects (default false)
CLOUDINARY_INCLUDE_EMPTY_FOLDERS=false

# Optional mp4 URLs for project videos
REACT_APP_BOTTEGA_VIDEO_MP4=https://your-cdn/video.mp4
REACT_APP_SELECT_VIDEO_MP4=https://your-cdn/video.mp4
```

Encode your API secret as Base64 before adding it to `.env`.

PowerShell:

```powershell
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("your_cloudinary_api_secret"))
```

Node:

```bash
node -e "console.log(Buffer.from('your_cloudinary_api_secret','utf8').toString('base64'))"
```

Cloudinary project data is auto-generated at build time from Admin API folder discovery.

Generate the Cloudinary projects snapshot with:

```bash
npm run sync:cloudinary-projects
```

This writes:

- `src/data/cloudinaryProjects.json` (auto-generated project cards)

The build process runs this automatically via `prebuild`, so deployments always compile with fresh server-generated project data.

Security notes:

- Never prefix admin credentials with `REACT_APP_`.
- Keep `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET_BASE64` only in server-side environment variables.
- Folder and project discovery are performed only on the server using Cloudinary Admin API credentials.

## Vercel Frontend Deployment

This repo is configured for static frontend deployment on Vercel.

Deploy steps:

1. Import this repo into Vercel.
2. Keep the project root at the repository root.
3. Add Vercel environment variables:
   - `REACT_APP_CLOUDINARY_CLOUD_NAME`
   - `REACT_APP_BOTTEGA_VIDEO_MP4` (optional)
   - `REACT_APP_SELECT_VIDEO_MP4` (optional)
4. Deploy.
5. Verify frontend is live at `/`.

SPA routing is handled by `vercel.json` so deep links resolve to `index.html`.

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
