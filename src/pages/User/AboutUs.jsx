import React from "react";
import { FaLinkedin, FaTwitter, FaGithub } from "react-icons/fa";
import Banner from "../../components/Banner";

const AboutUs = () => {
  const teamMembers = [
    {
      name: "Dương Minh Tài",
      position: "Backend Developer",
      bio: "Là một Backend Developer giàu kinh nghiệm, chuyên thiết kế và phát triển các hệ thống phía máy chủ hiệu quả, bảo mật và có khả năng mở rộng. Với nền tảng vững chắc về lập trình và công nghệ backend, anh đã góp phần xây dựng thành công nhiều ứng dụng và hệ thống phức tạp, đáp ứng nhu cầu đa dạng của khách hàng.",
      social: {
        linkedin: "#",
        twitter: "#",
        github: "#",
      },
    },
    {
      name: "Hồ Văn Phương",
      position: "Frontent Developer",
      bio: "Là một Frontend Developer đam mê sáng tạo giao diện web và ứng dụng thân thiện với người dùng. Với sự tinh tế trong thiết kế và kỹ năng lập trình vững chắc, anh đã góp phần mang đến những trải nghiệm trực quan, mượt mà và tương tác cho khách hàng trên các nền tảng số.",
      social: {
        linkedin: "#",
        twitter: "#",
        github: "#",
      },
    },
  ];

  return (
    <div>
      <Banner title="Giới thiệu" route="Trang chủ / Giới thiệu" />
      <div className="justify-center mb-20 relative">
        <section className="py-20 px-4 md:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-6">
                  Công ty chúng tôi
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Được thành lập từ năm 2024, FoodyRush là cửa hàng thời trang
                  hiện đại, nơi hội tụ những xu hướng mới nhất và phong cách độc
                  đáo. Chúng tôi cam kết mang đến cho khách hàng những sản phẩm
                  chất lượng cao, đa dạng và phù hợp với mọi phong cách. Với sự
                  kết hợp giữa sự sáng tạo và đam mê, chúng tôi không chỉ bán
                  thời trang mà còn truyền cảm hứng để bạn thể hiện cá tính
                  riêng qua từng bộ trang phục.
                </p>
              </div>
              <div className="flex-1">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  alt="Team collaboration"
                  className="rounded-lg shadow-xl w-full"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/800x600?text=Team+Image";
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 md:px-8 bg-gray-100">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Sứ mệnh
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Cung cấp các sản phẩm thời trang chất lượng cao, đa dạng và
                  hợp thời, giúp khách hàng tự tin thể hiện cá tính. Chúng tôi
                  cam kết xây dựng một cộng đồng thời trang phát triển bền vững
                  và mang lại giá trị lâu dài cho xã hội.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Tầm nhìn
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Trở thành thương hiệu thời trang hàng đầu, mang đến sự sáng
                  tạo và phong cách cho mọi khách hàng, đồng thời định hình xu
                  hướng thời trang bền vững trong tương lai.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 md:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
              Gặp gỡ nhóm chúng tôi
            </h2>
            <div className="flex justify-center gap-x-20">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-lg max-w-96 overflow-hidden transform transition-transform duration-300 hover:scale-105"
                >
                  <img
                    src={require(`../../assets/images/member_${index + 1}.jpg`)}
                    alt={member.name}
                    className="w-full h-80 object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/400x400?text=Team+Member";
                    }}
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900">
                      {member.name}
                    </h3>
                    <p className="text-gray-600 font-medium mb-2">
                      {member.position}
                    </p>
                    <p className="text-gray-500 mb-4">{member.bio}</p>
                    <div className="flex gap-4">
                      <a
                        href={member.social.linkedin}
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <FaLinkedin size={24} />
                      </a>
                      <a
                        href={member.social.github}
                        className="text-gray-400 hover:text-gray-900 transition-colors"
                      >
                        <FaGithub size={24} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;
