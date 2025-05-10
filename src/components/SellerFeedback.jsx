import { Badge } from "flowbite-react";

import { CalendarDays } from "lucide-react";

import Rating from "./Rating";
import { formatDate, formatURL } from "../utils/format";

function SellerFeedback({ user = null, content = "", createdDate = "" }) {
  return (
    <div className="flex flex-col px-5 py-3 ml-14 rounded-lg bg-[#f2f2f2]">
      <p className="font-medium mb-4">Phản hồi của người bán</p>
      <div className="flex flex-col gap-y-1">
        <div className="flex flex-row gap-x-2 items-center">
          <img
            className="w-10 h-10 rounded-full"
            src={formatURL(user?.avatarPath)}
            alt={user?.name}
          />
          <div className="flex flex-col gap-y-1">
            <div className="flex flex-row gap-x-3 items-center">
              <p className="text-sm font-medium">{user?.fullName}</p>
              <Badge color={"gray"} icon={CalendarDays}>
                {formatDate(createdDate)}
              </Badge>
            </div>
          </div>
        </div>
        <div className="ml-12 text-sm mt-1">{content}</div>
      </div>
    </div>
  );
}

export default SellerFeedback;
