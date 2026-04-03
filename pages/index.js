// eslint-disable-next-line no-unused-vars
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";

function Home() {
  const [hearts, setHearts] = useState([]);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    setShowMessage(true);
  }, []);

  const createHeart = (e) => {
    const newHeart = {
      id: Date.now() + Math.random(),
      x: e.clientX,
      y: e.clientY,
    };
    setHearts((prev) => [...prev, newHeart]);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 2000);
  };

  return (
    <div
      onClick={createHeart}
      className="min-h-screen bg-gradient-to-br from-pink-300 via-purple-300 to-pink-400 flex items-center justify-center overflow-hidden relative cursor-pointer"
    >
      {/* Corações flutuantes de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <Heart
            key={i}
            className="absolute text-white opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${20 + Math.random() * 30}px`,
              height: `${20 + Math.random() * 30}px`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
            fill="currentColor"
          />
        ))}
      </div>

      {/* Corações clicáveis */}
      {hearts.map((heart) => (
        <Heart
          key={heart.id}
          className="absolute text-red-500 pointer-events-none animate-float"
          style={{
            left: heart.x,
            top: heart.y,
            width: "30px",
            height: "30px",
          }}
          fill="currentColor"
        />
      ))}

      {/* Conteúdo principal */}
      <div
        className={`text-center z-10 p-8 bg-white bg-opacity-20 backdrop-blur-sm rounded-3xl shadow-2xl transform transition-all duration-1000 ${showMessage ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
      >
        <div className="mb-6 animate-bounce">
          <Heart
            className="w-20 h-20 mx-auto text-red-500"
            fill="currentColor"
          />
        </div>

        <h1 className="text-6xl font-bold text-white mb-6 drop-shadow-lg">
          Hey, gata 💕
        </h1>

        <p className="text-2xl text-white mb-8 drop-shadow-md leading-relaxed">
          Eu já falei que te amo hoje? s2s2
        </p>

        <div className="text-lg text-white opacity-90">
          <p className="italic">Clique na tela para criar corações ✨</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) scale(0);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default Home;
