"use client";

import React from "react";
import { LayoutDashboard, LayoutList } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";

const DashboardPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-y-2">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <span className="text-sm text-slate-700">
            Overview of your activities and quick access to your tools and
            projects.
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
        <div>
          <div className="flex items-center gap-x-2">
            <IconBadge icon={LayoutDashboard} />
            <h2 className="text-xl text-slate-800">Quick Access</h2>
          </div>
          <div className="dashboard-container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Placeholder for dashboard items */}
              <div className="dashboard-item p-4 border border-gray-300 rounded">
                <p>Project 1: E-commerce Website</p>
              </div>
              <div className="dashboard-item p-4 border border-gray-300 rounded">
                <p>Project 2: Portfolio Website</p>
              </div>
              <div className="dashboard-item p-4 border border-gray-300 rounded">
                <p>Tool 1: Design Editor</p>
              </div>
              <div className="dashboard-item p-4 border border-gray-300 rounded">
                <p>Tool 2: Analytics Dashboard</p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-x-2">
            <IconBadge icon={LayoutList} />
            <h2 className="text-xl text-slate-800">Recent Activities</h2>
          </div>
          <div className="activity-container">
            <div className="grid grid-cols-1 gap-4 mt-4">
              {/* Placeholder for recent activity items */}
              <div className="activity-item p-4 border border-gray-300 rounded">
                <p>Updated Project 1</p>
                <span className="text-sm text-slate-600">2 hours ago</span>
              </div>
              <div className="activity-item p-4 border border-gray-300 rounded">
                <p>Added new design to Tool 1</p>
                <span className="text-sm text-slate-600">1 day ago</span>
              </div>
              <div className="activity-item p-4 border border-gray-300 rounded">
                <p>Analyzed data in Tool 2</p>
                <span className="text-sm text-slate-600">3 days ago</span>
              </div>
              <div className="activity-item p-4 border border-gray-300 rounded">
                <p>Reviewed Project 2</p>
                <span className="text-sm text-slate-600">1 week ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
