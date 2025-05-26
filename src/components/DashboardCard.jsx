export default function DashboardCard({ title, value, description, icon }) {
  return (
    <div className="flex-1 flex-row flex p-6 gap-x-3 bg-white rounded-lg shadow-md">
      <div className="flex flex-col gap-y-1">
        <p className="font-normal text-gray-700 dark:text-gray-400">{title}</p>
        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {value}
        </h5>
        <p className="font-normal text-gray-700 dark:text-gray-400">
          {description}
        </p>
      </div>
      {icon}
    </div>
  );
}
