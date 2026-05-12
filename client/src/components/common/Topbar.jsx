import { Bell } from "lucide-react";

const Topbar = ({
  user,
  title,
  subtitle,
}) => {

  const dateText = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const defaultTitle =
    user?.role === "admin"
      ? "Admin Dashboard"
      : user?.role === "owner"
      ? "Owner Dashboard"
      : "Dashboard";

  return (
    <header className="bg-white border-b border-gray-200 shrink-0">

      <div className="px-5 lg:px-8 py-5">

        <div className="flex items-center justify-between gap-5">

          {/* LEFT */}
          <div className="min-w-0">

            <h1 className="text-[30px] lg:text-[34px] leading-tight font-semibold tracking-tight text-gray-900">
              {title || defaultTitle}
            </h1>

            <p className="mt-1.5 text-sm text-gray-500 flex flex-wrap items-center">

              {subtitle || (
                <>
                  <span>
                    {dateText}
                  </span>

                  <span className="mx-2 text-gray-300">
                    •
                  </span>

                  <span>
                    Welcome back,
                  </span>

                  <span className="font-medium text-gray-700 ml-1">
                    {user?.name || "User"}
                  </span>
                </>
              )}

            </p>

          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3 shrink-0">

            {/* Notification */}
            <button
              type="button"
              aria-label="Notifications"
              className="
                relative
                w-11
                h-11
                rounded-xl
                border
                border-gray-200
                bg-white
                flex
                items-center
                justify-center
                text-gray-600
                hover:bg-gray-50
                transition-all
                duration-200
              "
            >

              <Bell className="w-[18px] h-[18px]" />

              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />

            </button>

            {/* Avatar */}
            <div
              className="
                w-11
                h-11
                rounded-xl
                bg-gradient-to-br
                from-indigo-500
                to-violet-600
                flex
                items-center
                justify-center
                text-white
                text-sm
                font-semibold
                shadow-md
              "
            >

              {user?.name?.[0]?.toUpperCase() || "A"}

            </div>

          </div>

        </div>

      </div>

    </header>
  );
};

export default Topbar;