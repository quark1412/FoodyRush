import React from "react";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  svgClassName,
  textClassName,
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxPages = 4;

    if (totalPages <= maxPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      pages.push(1);

      if (startPage > 2) {
        pages.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageChange = (page) => {
    if (page !== "...") {
      onPageChange(page);
    }
  };

  return (
    <div className="flex justify-center">
      <nav
        className="relative z-0 inline-flex rounded-md -space-x-px"
        aria-label="Pagination"
      >
        {/* Previous button */}
        {currentPage === 1 ? (
          <a
            className="relative inline-flex items-center px-2 py-2 border-none bg-white text-sm font-bold text-gray-500 cursor-not-allowed"
            href="javascript:void(0)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="#D9D9D9"
              className={`${svgClassName}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </a>
        ) : (
          <a
            className="relative inline-flex cursor-pointer items-center px-2 py-2 border-none bg-white text-sm font-bold text-gray-500"
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className={`${svgClassName}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </a>
        )}

        {/* Page numbers */}
        {getPageNumbers().map((page, index) => (
          <a
            key={index}
            onClick={() => handlePageChange(page)}
            className={`relative inline-flex items-center border-none ${
              currentPage === page ? "bg-gray-300" : "bg-white"
            } ${textClassName} font-bold text-gray-700 hover:bg-gray-300 cursor-pointer`}
          >
            {page}
          </a>
        ))}

        {/* Next button */}
        {currentPage === totalPages ? (
          <a
            className="relative inline-flex items-center px-2 py-2 border-none bg-white text-sm font-bold text-gray-500 cursor-not-allowed"
            href="javascript:void(0)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="#D9D9D9"
              className={`${svgClassName}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </a>
        ) : (
          <a
            className="relative inline-flex cursor-pointer items-center px-2 py-2 border-none bg-white text-sm font-bold text-gray-500"
            onClick={() => handlePageChange(currentPage + 1)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className={`${svgClassName}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </a>
        )}
      </nav>
    </div>
  );
};

export default Pagination;
