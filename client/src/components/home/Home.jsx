import React from "react";
import RecomUsers from "./RecomUsers";
import PostLists from "../post/PostLists";

function Home() {
  return (
    <div className="flex justify-center md:justify-between md: pl-24 max-w-[1200px] mx-auto px-4 mt-8 gap-10">
      {/* MAIN FEED (Posts) */}
      <div className="w-full md:w-[65%] lg:w-[60%]">
        <PostLists />
      </div>

      {/* SIDEBAR (Recommended Users) — visible from md and up */}
      <div className="hidden md:block w-[280px] lg:w-[300px] shrink-0">
        <RecomUsers />
      </div>
    </div>
  );
}

export default Home;
