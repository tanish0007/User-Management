export default function AgeBadge({ age }: { age: number }) {
  if (age < 25)
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
        {age}
      </span>
    );
  if (age < 60)
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
        {age}
      </span>
    );
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
      {age}
    </span>
  );
}