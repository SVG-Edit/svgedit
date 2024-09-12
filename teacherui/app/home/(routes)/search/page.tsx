"use client";

import React, { useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { CanvasBox } from "./courses/CanvasBox";

interface SearchPageProps {
  initialData?: {
    title: string;
  };
}

const SearchPage: React.FC<SearchPageProps> = ({ initialData }) => {
  const [courseTitle, setCourseTitle] = useState(initialData?.title || "");

  const handleTitleSave = (newTitle: string) => {
    setCourseTitle(newTitle);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-y-2">
          <h1 className="text-2xl font-bold">Design A Course Deck</h1>
          <span className="text-sm text-slate-700">
            Start adding images and other course materials below to get started!
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
        <div>
          <div className="flex items-center gap-x-2">
            <IconBadge icon={LayoutDashboard} />
            <h2 className="text-xl text-slate-800">Customize your deck</h2>
          </div>
          <div className="canvas-container">
            <CanvasBox />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
