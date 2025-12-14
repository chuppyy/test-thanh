import Image from "next/image";
import { GetServerSideProps } from "next";
import axios from "axios";
import React from "react";
import Link from "next/link";

export default function Home(props: any) {
  const { data } = props;
  console.log(data);
  return (
    <div className="container">
      <div className="banner-container">
        <div className="banner-custom">
          <div className="banner">
            <Image
              src="/hinh0.png"
              alt="hinh0"
              className="image-full"
              width={500}
              height={300}
              priority
            />
           
          </div>
        </div>
        <div className="banner-item">
          <div className="banner">
            <Image
              src="/hinh1.png"
              alt="hinh0"
              className="image-full"
              width={500}
              height={300}
              priority
            />
          
          </div>
          <div className="banner">
            <Image
              src="/hinh2.png"
              alt="hinh0"
              className="image-full"
              width={500}
              height={300}
              priority
            />
          
          </div>
          <div className="banner">
            <Image
              src="/hinh3.png"
              alt="hinh0"
              className="image-full"
              width={500}
              height={300}
              priority
            />
          
          </div>
          <div className="banner">
            <Image
              src="/hinh4.png"
              alt="hinh0"
              className="image-full"
              width={500}
              height={300}
              priority
            />
           
          </div>
        </div>
      </div>
      <div className="news-container">
        {data.map((group: any, index: number) => (
          <React.Fragment key={index}>
            <h1>{group.groupName}</h1>
            <div className="news-list">
              {group.detail.map((item: any, idx: number) => (
                <div className="news-item" key={idx}>
                  <Image
                    src={item.avatarLink}
                    alt={item.name}
                    className="image-full"
                    width={300}
                    height={300}
                    priority
                    unoptimized
                  />
                  <p className="new-title">{item.name}</p>

                  <Link className="read-more" href={`/${item.id}`}>
                    Read more...
                  </Link>
                </div>
              ))}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<any> = async () => {
  try {
    const response = await axios.get(`${process.env.APP_API2}/News/news-list`);
    console.log("response", response);
    return {
      props: { data: response.data.data },
    };

// const groupModel = [
//       "d01a8b56-2987-4e28-aaad-23ca0d741e4a",
//       "dfcfd087-1d55-49d4-9f12-976852062200",
//       "b2b4f2c2-69e9-4750-9feb-dbfc1d839b15",
//       "2196a244-0ec0-4579-89fe-49e4c3781839"
//     ];
//     const numberOf = 4;

//     const response = await axios.get(
//       `${process.env.APP_API2}/News/news-list?numberOf=${numberOf}`,
//       groupModel, // body
//       {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );
//     return {
//       props: { data: response.data.data },
//     };



  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: { data: [] as any[] }, // Sử dụng any type cho data
    };
  }
};
