// pages/HomePage.js
import React from "react";

interface HomePageProps {
  // define any props here, if needed
}

const HomePage: React.FC<HomePageProps> = (props) => {  return (
    <div>
      <h1 className="text-center text-2xl">Welcome to Cash Manager 2.0</h1>
    </div>
  );
};

export default HomePage;
