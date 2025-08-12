import React from "react";
import Button from "../components/button";
import AdminLayout from "../components/layout";
import Card from "../components/card";

const HomePage: React.FC = () => {
  const [loading, setLoading] = React.useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <AdminLayout title="Home">
      <div className="space-y-4">
        <div>Home Page</div>
        <Button
          name={loading ? "Loading" : "Click Me"}
          loading={loading}
          icon={<div className="i-solar:plain-bold-duotone size-5" />}
          type="button"
          onClick={handleClick}
          width="170px"
          height="40px"
        />
        {/* Example Card usage */}
        <Card width="w-full max-w-md mx-auto" height="h-[300px]">
          <div className="text-center mb-4">
            {/* <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-2 bg-indigo-100">
              <span className="i-solar:credit-card-bold-duotone size-8 text-indigo-600" />
            </div> */}
            <h2 className="text-xl font-bold text-gray-900">Card Title</h2>
            <p className="text-gray-600">This is an example card component.</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Button
              name="Card Action"
              type="button"
              width="120px"
              height="36px"
            />
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default HomePage;
