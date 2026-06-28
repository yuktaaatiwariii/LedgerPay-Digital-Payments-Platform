import React from 'react'
import image from "../public/image.png"
import { Link } from "react-router-dom";


const LandingPage = () => {


  const features = [
    {
      icon: "🔒",
      title: "Secure Authentication",
      subtitle: "Advanced Security",
      desc: "Multi-factor authentication & data encryption.",
    },
    {
      icon: "💸",
      title: "Money Transfers",
      subtitle: "Fast Transactions",
      desc: "Instant secure transfers .",
    },
    {
      icon: "📒",
      title: "Ledger-Based Accounting",
      subtitle: "Accurate Bookkeeping",
      desc: "Reliable record-keeping and audit trails.",
    },
    {
      icon: "📊",
      title: "Real-Time Balance Tracking",
      subtitle: "Live Monitoring",
      desc: "Monitor balance and activity instantly, 24/7.",
    },
  ];

  return (
    <div className="min-h-screen text-gray-800">
      <div className= " z-[-1] h-full w-full bg-linear-to-r from-blue-50 via-blue-100 to-blue-200 pb-40 "  >
      {/* Navbar */}
      <header className="pt-4 ">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-3xl bg-blue-50 px-8 py-3 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="text-4xl text-blue-700">↻</div>
            <h1 className="text-3xl font-bold text-slate-800">
              Smart Bank
            </h1>
          </div>

          <div className="flex gap-4">
            <Link to="/login"  className="rounded-full border border-slate-500 px-8 py-3 font-semibold"> 
              Login
            </Link>

            <Link to="/register"
                 className="rounded-full bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700" >
               Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto mt-14 grid max-w-7xl grid-cols-1 items-center gap-6 px-8 lg:grid-cols-2">

        <div>
          <h2 className="text-7xl font-extrabold leading-tight text-blue-800">
            Smart Bank
            <br />
            Transaction
            <br />
            System
          </h2>

          <p className="mt-6 max-w-xl text-[22px] leading-relaxed text-gray-700">
            The Secure, Efficient, and Real-Time Solution for
            modern financial management.
          </p>

          <div className="mt-7 flex gap-5">
            <button className="rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg">
              Get Started Free
            </button>

            <button className="rounded-full border border-gray-500 bg-white px-8 py-4 text-lg font-semibold">
              Learn More
            </button>
          </div>
        </div>

        {/* Illustration Placeholder */}
        <div className=" ">
        <img className='h-110' src={image} alt="bank pic" />
        </div>
      </section>
    </div>
      {/* Features */}
      <section className=" mx-auto -mt-20 grid max-w-7xl gap-6 px-8 md:grid-cols-2 xl:grid-cols-4">

        {features.map((item) => (
          <div
            key={item.title}
            className="rounded-3xl bg-gradient-to-b from-blue-300 to-blue-200 bg-white p-5 shadow-xl transition hover:-translate-y-2"
          >
            <div className='flex  '>
            <div className="mx-2 text-4xl">
              {item.icon}
            </div>

            <h3 className="text-xl font-bold">
              {item.title}
            </h3> </div>

            <h4 className="mx-6 my-3 text-xl font-semibold">
              {item.subtitle}
            </h4>

            <p className="mx-6 my-3 text-lg leading-6 text-gray-700">
              {item.desc}
            </p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="mt-24 border-t bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-8 py-8 md:flex-row">

          <div className="flex gap-8 text-lg">
            <a href="/">Home</a>
            <a href="/">Features</a>
          </div>

          <div className="text-2xl font-bold text-blue-800">
            Smart Bank
          </div>

          <div className="text-gray-500">
            © 2025 Smart Bank
          </div>  
        </div>
      </footer>
    </div>
  );
}
  


export default LandingPage
