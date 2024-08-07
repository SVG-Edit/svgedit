# Teacher UI Experience IMAGE

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

Node.js version >= v18.17.0 is required.

Install these dependencies using npm:

```bash
npm i
```

First, run the development server:

```bash
npm run dev
```





Open [http://localhost:3000/home/tutorial](http://localhost:3000/home/tutorial) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.


## Usage

### ImageUploader Component

The `ImageUploader` component allows users to upload an image, view the uploaded image, and download it. The uploaded image is also saved in the local storage.

```jsx
import React from "react";
import ImageUploader from "./components/ImageUploader";

const App = () => (
  <div>
    <h1>Image Uploader</h1>
    <ImageUploader />
  </div>
);

export default App;
```

### TutorialPage Component

The `TutorialPage` component allows users to upload, organize, and manage image decks. It also includes an FAQ section about the Monarch device and its usage.

```jsx
import React from "react";
import TutorialPage from "./components/TutorialPage";

const App = () => (
  <div>
    <TutorialPage />
  </div>
);

export default App;
```

### SearchPage Component

The `SearchPage` component allows users to design a course deck by adding images and other course materials.

```jsx
import React from "react";
import SearchPage from "./components/SearchPage";

const App = () => (
  <div>
    <SearchPage />
  </div>
);

export default App;
```

### CanvasBox Component

The `CanvasBox` component allows users to upload images, organize them into a deck, and manage them. It includes features for dragging and dropping images to reorder them, adding notes to images, and entering a presenter mode.

```jsx
import React from "react";
import CanvasBox from "./components/CanvasBox";

const App = () => (
  <div>
    <CanvasBox />
  </div>
);

export default App;
```



## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Dependencies

The project uses the following dependencies:

- `react`: ^17.0.2
- `react-dom`: ^17.0.2
- `next`: ^12.0.7
- `react-beautiful-dnd`: ^13.1.0
- `jszip`: ^3.7.1
- `file-saver`: ^2.0.5
- `react-icons`: ^4.3.1
- `@/components/ui/button`: Custom button component
- `@/components/ui/accordion`: Custom accordion component
- `@/components/ui/icon-badge`: Custom icon badge component
- `@/components/courses/CanvasBox`: Custom CanvasBox component
- `useUndoRedo`: Custom hook for undo/redo functionality


