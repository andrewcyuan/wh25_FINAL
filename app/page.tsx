import HomepageGoogleSignInButton from "@/components/HomepageGoogleSignIn";
import IntegratedDataDashboard from "@/components/IntegratedDataDashboard";

export default function Home() {
  

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6 bg-foreground bg-clip-text text-transparent">
          22nd-Century Farming for Everyone
        </h1>
        <p className="text-xl mb-8 max-w-2xl text-gray-600 dark:text-gray-400">
          Drone crop management. Predictive disaster warnings. The world's farming knowledge at your fingertips. <span className="font-bold">FarmFlight</span> gives you cutting-edge AI for your family farm.
        </p>
        <div className="flex flex-col gap-4">
          <HomepageGoogleSignInButton />
        </div>
      </div>

      <IntegratedDataDashboard />

      <h1 className="text-4xl mt-[60px] mb-8">Multi-source intelligence for modern farming</h1>
      <p className="md:w-[80%] text-center mb-12">
        FarmFlight aggregates critical data from multiple trusted sources - including National Weather Service forecasts, 
        drone footage, and agricultural community forums - to deliver comprehensive insights. 
        Control your farming operations remotely with precision scheduling for watering, seeding, and monitoring.
      </p>

    </div>
  );
}
