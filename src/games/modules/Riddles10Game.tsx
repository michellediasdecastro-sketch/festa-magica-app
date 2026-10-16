import React from "react";
import type { GameModule, Challenge, PartyContext } from "../../lib/gameTypes";

// Super Base de Dados: 90 Charadas Variadas!
const RIDDLES = [
  { q: "Tem coroa, mas não é rei. Tem escama, mas não é peixe.", a: "ABACAXI", wrong: ["FANTASMA", "CEBOLA", "LEÃO"] },
  { q: "Cai em pé e corre deitado.", a: "CHUVA", wrong: ["BOLA", "GATO", "ÁGUA"] },
  { q: "Quanto mais se tira, maior fica.", a: "BURACO", wrong: ["BOLO", "SOMBRA", "DÍVIDA"] },
  { q: "Nasce grande e morre pequeno.", a: "LÁPIS", wrong: ["SOL", "SAPATO", "ÁRVORE"] },
  { q: "Feito para andar, mas não anda.", a: "RUA", wrong: ["CARRO", "SAPATO", "PÉ"] },
  { q: "Tem cabeça e tem dente, não é bicho e nem é gente.", a: "ALHO", wrong: ["PENTE", "SERRA", "ZÍPER"] },
  { q: "Sobe quando a chuva desce.", a: "GUARDA-CHUVA", wrong: ["BALÃO", "PÁSSARO", "FUMAÇA"] },
  { q: "Tem pescoço e não tem cabeça, tem braços e não tem mãos.", a: "CAMISA", wrong: ["BONECO", "RELÓGIO", "CADEIRA"] },
  { q: "Anda com os pés na cabeça.", a: "PIOLHO", wrong: ["CHAPÉU", "MACACO", "SAPATO"] },
  { q: "Passa a vida na janela e, mesmo dentro de casa, está fora dela.", a: "BOTÃO", wrong: ["CORTINA", "VIDRO", "VENTO"] },
  { q: "Tem bico, mas não bica. Tem asa, mas não voa.", a: "BULE", wrong: ["PATO", "AVIÃO", "XÍCARA"] },
  { q: "De dia tem 4 pés, de noite tem 6.", a: "CAMA", wrong: ["MESA", "GATO", "CADEIRA"] },
  { q: "Quanto mais cresce, menos se vê.", a: "ESCURIDÃO", wrong: ["NUVEM", "NEBLINA", "SOMBRA"] },
  { q: "Fica cheio de boca para baixo e vazio de boca para cima.", a: "CHAPÉU", wrong: ["COPO", "BALDE", "MALA"] },
  { q: "Tem folhas, mas não é árvore. Tem capa, mas não é herói.", a: "LIVRO", wrong: ["CADERNO", "CAMA", "ALFACE"] },
  { q: "Tem dentes, mas não morde.", a: "PENTE", wrong: ["GARFO", "SERRA", "TUBARÃO"] },
  { q: "Tem um olho, mas não vê.", a: "AGULHA", wrong: ["FURAÇÃO", "CEGO", "BATATA"] },
  { q: "Pertence a você, mas os outros usam mais do que você.", a: "NOME", wrong: ["DINHEIRO", "TELEFONE", "ROUPA"] },
  { q: "Tem que ser quebrado antes de se usar.", a: "OVO", wrong: ["NOZ", "VIDRO", "COCO"] },
  { q: "Sou alto quando jovem e baixo quando velho.", a: "VELA", wrong: ["ÁRVORE", "LÁPIS", "HUMANO"] },
  { q: "Tem muitas chaves, mas não abre portas.", a: "PIANO", wrong: ["CHAVEIRO", "CADEADO", "COMPUTADOR"] },
  { q: "Pode ser pego, mas não atirado.", a: "RESFRIADO", wrong: ["BOLA", "FRISBEE", "PEDRA"] },
  { q: "Fala, mas não tem boca. Ouve, mas não tem ouvidos.", a: "ECO", wrong: ["RÁDIO", "FANTASMA", "ESPELHO"] },
  { q: "Voa sem asas e chora sem olhos.", a: "NUVEM", wrong: ["VENTO", "AVIÃO", "FANTASMA"] },
  { q: "Dorme com os sapatos calçados.", a: "CAVALO", wrong: ["SOLDADO", "CACHORRO", "GATO"] },
  { q: "Pula no ar, estoura e vira do avesso.", a: "PIPOCA", wrong: ["BALÃO", "BOLA", "SAPO"] },
  { q: "É verde mas não é planta, fala mas não é gente.", a: "PAPAGAIO", wrong: ["RÁDIO", "ALIEN", "GRAVADOR"] },
  { q: "Tem cidades, lojas e ruas, mas não tem pessoas.", a: "MAPA", wrong: ["SHOPPING", "MAQUETE", "DESERTO"] },
  { q: "Sobe e desce, mas não sai do lugar.", a: "ESCADA", wrong: ["ELEVADOR", "SOL", "BALANÇA"] },
  { q: "Tem quatro pernas, mas não anda.", a: "CADEIRA", wrong: ["MESA", "CACHORRO", "GAVIÃO"] },
  { q: "Passa diante do sol e não faz sombra.", a: "VENTO", wrong: ["NUVEM", "PÁSSARO", "LUA"] },
  { q: "Quanto mais seca, mais molhada fica.", a: "TOALHA", wrong: ["ÁGUA", "ESPONJA", "AREIA"] },
  { q: "Tem orelhas, mas não ouve.", a: "PANELA", wrong: ["CANECA", "COELHO", "MACACO"] },
  { q: "Corre a casa inteira e depois vai dormir num canto.", a: "VASSOURA", wrong: ["CACHORRO", "GATO", "RATO"] },
  { q: "Bate o dia inteiro sem sentir dor.", a: "CORAÇÃO", wrong: ["MARTELO", "RELOGIO", "SINO"] },
  { q: "Não tem pé e corre, tem leito e não dorme.", a: "RIO", wrong: ["VENTO", "TREM", "CARRO"] },
  { q: "Fica no início do amor, no meio do mar e no fim da vila.", a: "LETRA A", wrong: ["LETRA M", "ÁGUA", "SENTIMENTO"] },
  { q: "Dá muitas voltas e não sai do lugar.", a: "RELÓGIO", wrong: ["PIÃO", "RODA", "VENTILADOR"] },
  { q: "Anda deitado e dorme em pé.", a: "PÉ", wrong: ["COBRA", "SAPATO", "MINHOCA"] },
  { q: "Quanto mais se perde, mais se tem.", a: "SONO", wrong: ["TEMPO", "DINHEIRO", "FOME"] },
  { q: "O que é que a gente compra para comer, mas não come?", a: "PRATO", wrong: ["TALHER", "PANELA", "MESA"] },
  { q: "Qual é o céu que não tem estrelas?", a: "CÉU DA BOCA", wrong: ["CÉU NUBLADO", "TETO", "ESPAÇO"] },
  { q: "Tem luz, mas vive no escuro.", a: "VAGA-LUME", wrong: ["LANTERNA", "LÂMPADA", "FANTASMA"] },
  { q: "Quebra quando se fala.", a: "SEGREDO", wrong: ["VIDRO", "GELO", "SILÊNCIO"] },
  { q: "Tem cabelo, mas não é pessoa. Tem dente, mas não morde.", a: "MILHO", wrong: ["ALHO", "PENTE", "BONECA"] },
  { q: "Vê tudo, mas não tem olhos.", a: "ESPELHO", wrong: ["CÂMERA", "DEUS", "CORUJA"] },
  { q: "Cresce para baixo e diminui para cima.", a: "RAIZ", wrong: ["CENOURA", "CABELO", "UNHA"] },
  { q: "Entra na água e não se molha, entra no fogo e não se queima.", a: "SOMBRA", wrong: ["GELO", "VENTO", "LUZ"] },
  { q: "Passa pela água e não se molha, passa pelo vidro e não o quebra.", a: "LUZ", wrong: ["SOMBRA", "VENTO", "SOM"] },
  { q: "Quanto mais lava, mais suja fica.", a: "ÁGUA", wrong: ["ROUPA", "MÃO", "PANELA"] },
  { q: "O que é que tem cintura, mas não tem pernas?", a: "VIOLÃO", wrong: ["CALÇA", "CADEIRA", "MESA"] },
  { q: "Feito de água, mas se colocado na água, morre.", a: "GELO", wrong: ["NEVE", "SAL", "AÇÚCAR"] },
  { q: "Tem cinco dedos, mas não tem unha nem osso.", a: "LUVA", wrong: ["MÃO", "MEIA", "PÉ"] },
  { q: "Não tem olhos, mas pisca. Não tem boca, mas comanda o trânsito.", a: "SEMÁFORO", wrong: ["POLICIAL", "CARRO", "POSTE"] },
  { q: "Tem cara, mas não tem olhos. Tem mãos, mas não tem braços.", a: "RELÓGIO", wrong: ["MOEDA", "BONECO", "QUADRO"] },
  { q: "Fica mais alto quando senta e mais baixo quando levanta.", a: "CACHORRO", wrong: ["CADEIRA", "SAPO", "MACACO"] },
  { q: "Qual é a planta que anda e até fala?", a: "PLANTA DO PÉ", wrong: ["SAMAMBAIA", "GIRASSOL", "ÁRVORE"] },
  { q: "Nasce no mato, bate no mato, chega em casa e vai pro canto.", a: "MACHADO", wrong: ["VASSOURA", "CACHORRO", "PÁSSARO"] },
  { q: "Qual é o mês mais curto do ano?", a: "MAIO", wrong: ["FEVEREIRO", "ABRIL", "DIAS"] },
  { q: "Não se come, mas é bom para se comer.", a: "COLHER", wrong: ["PRATO", "FOME", "MESA"] },
  { q: "O que tem no meio da Terra?", a: "LETRA R", wrong: ["NÚCLEO", "ÁGUA", "FOGO"] },
  { q: "O que tem no meio do ovo?", a: "LETRA V", wrong: ["GEMA", "CLARA", "PINTO"] },
  { q: "Se você tem, quer compartilhar. Se você compartilha, você não tem mais.", a: "SEGREDO", wrong: ["BOLO", "DINHEIRO", "BRINQUEDO"] },
  { q: "Nasce branco, fica verde, fica vermelho e morre preto.", a: "CAFÉ", wrong: ["TOMATE", "MORANGO", "FOLHA"] },
  { q: "Qual é o botão que não se aperta?", a: "BOTÃO DE ROSA", wrong: ["CAMISA", "ELEVADOR", "RÁDIO"] },
  { q: "Cai da torre e não se quebra, mas cai na água e se desfaz.", a: "PAPEL", wrong: ["PEDRA", "PENA", "FOLHA"] },
  { q: "Você me responde, embora eu nunca te faça perguntas.", a: "TELEFONE", wrong: ["ECO", "ESPELHO", "RÁDIO"] },
  { q: "O que é que a mesa tem quatro e você tem dois?", a: "PÉS", wrong: ["OLHOS", "BRAÇOS", "PERNAS"] },
  { q: "Enche uma casa inteira, mas não pesa uma grama.", a: "LUZ", wrong: ["AR", "FUMAÇA", "SOMBRA"] },
  { q: "Todo mundo leva, todo mundo tem, porque a todos lhes dão um.", a: "NOME", wrong: ["CORAÇÃO", "CABEÇA", "RG"] },
  { q: "Está sempre a caminho, mas nunca chega.", a: "AMANHÃ", wrong: ["VENTO", "FUTURO", "TREM"] },
  { q: "O que tem boca, mas nunca fala?", a: "RIO", wrong: ["CAVERNA", "FOGÃO", "SAPATO"] },
  { q: "Posso ser quebrado sem sequer ser tocado.", a: "PROMESSA", wrong: ["VIDRO", "CORAÇÃO", "SILÊNCIO"] },
  { q: "O que desaparece assim que você diz o seu nome?", a: "SILÊNCIO", wrong: ["SEGREDO", "SOM", "MISTÉRIO"] },
  { q: "O que sobe branco e desce amarelo?", a: "OVO FRITO", wrong: ["NUVEM", "SOL", "PIPOCA"] },
  { q: "Sem mim a planta não cresce e sem mim a vida perece.", a: "ÁGUA", wrong: ["TERRA", "LUZ", "AR"] },
  { q: "O que não tem vida, mas pode morrer?", a: "BATERIA", wrong: ["FOGO", "TEMPO", "CARRO"] },
  { q: "Qual o bicho que não é de verdade, mas que todo mundo tem medo?", a: "BICHO-PAPÃO", wrong: ["FANTASMA", "DRAGÃO", "LEÃO"] },
  { q: "De noite aparecem sem serem chamadas, de dia somem sem serem roubadas.", a: "ESTRELAS", wrong: ["NUVENS", "CORUJAS", "LÂMPADAS"] },
  { q: "O que a fechadura disse para a chave?", a: "VAMOS DAR UMA VOLTA", wrong: ["ABRA A PORTA", "BOM DIA", "VOCÊ É DE FERRO"] },
  { q: "Tenho raízes que ninguém vê, sou mais alto que as árvores.", a: "MONTANHA", wrong: ["NUVEM", "PRÉDIO", "GIGANTE"] },
  { q: "Vou a todos os lugares, mas sempre fico no meu canto.", a: "SELO", wrong: ["CARTA", "MAPA", "PÁSSARO"] },
  { q: "Onde sexta-feira vem antes de quinta-feira?", a: "DICIONÁRIO", wrong: ["CALENDÁRIO", "ESCOLA", "ESPAÇO"] },
  { q: "O que pode ser do tamanho de um elefante, mas não pesa nada?", a: "SOMBRA", wrong: ["NUVEM", "BALÃO", "FANTASMA"] },
  { q: "Qual é o animal que não vale mais nada?", a: "JAVALI", wrong: ["PORCO", "COBRA", "RATO"] },
  { q: "Pode ser grande ou pequeno, mas sempre tem o mesmo formato.", a: "CÍRCULO", wrong: ["QUADRADO", "BOLA", "MUNDO"] },
  { q: "Tem pernas, mas não caminha. Tem comida, mas não come.", a: "MESA", wrong: ["CADEIRA", "FOGÃO", "PRATO"] },
  { q: "Eu tenho asas, mas não posso voar. Eu não tenho olhos, mas posso chorar.", a: "NUVEM", wrong: ["ANJO", "MORCEGO", "PÁSSARO"] },
  { q: "Dá um pulo e se veste de noiva.", a: "PIPOCA", wrong: ["SAPO", "PULGA", "NOIVA"] },
  { q: "Se me amarrarem eu ando, se me soltarem eu paro.", a: "SAPATO", wrong: ["CACHORRO", "CAVALO", "BARCO"] }
];

const generateRiddlesChallenge = (difficulty: number, context: PartyContext, history: string[]): Challenge => {
  let riddle;
  let attempts = 0;
  
  // A trava verifica a resposta exata no histórico para nunca repetir a charada recentemente
  do {
    riddle = RIDDLES[Math.floor(Math.random() * RIDDLES.length)];
    attempts++;
  } while (history.some(h => h.includes(riddle.a)) && attempts < 80); // Trava elevada para pesquisar profundamente na lista

  const options = [riddle.a, ...riddle.wrong].sort(() => Math.random() - 0.5);

  return {
    id: `riddle10-${Date.now()}-${riddle.a}`, // A resposta vai no ID para a trava funcionar
    instruction: "O que é, o que é?",
    spokenText: "Leia a charada com muita atenção e tente adivinhar a resposta certa.",
    data: { question: riddle.q, options, answer: riddle.a }
  };
};

const Riddles10Component: React.FC<{ challenge: Challenge, onAnswer: (isCorrect: boolean, scoreDelta: number) => void }> = ({ challenge, onAnswer }) => {
  const { question, options, answer } = challenge.data;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      <div className="bg-black/50 p-6 sm:p-8 rounded-[2rem] border border-white/20 shadow-inner w-full text-center min-h-[8rem] flex items-center justify-center">
        <h3 className="text-xl sm:text-3xl font-black text-white leading-relaxed drop-shadow-md">
          "{question}"
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
        {options.map((opt: string, idx: number) => (
          <button
            key={idx}
            onClick={() => onAnswer(opt === answer, 40)}
            className="py-4 sm:py-6 rounded-3xl bg-black/60 border border-white/30 hover:border-[#bef264] hover:bg-white/5 transition-all text-sm sm:text-xl font-black shadow-xl active:scale-95 text-white tracking-wide flex items-center justify-center text-center px-2"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export const Riddles10GameModule: GameModule = {
  id: "riddles-10",
  title: "Charadas e Enigmas",
  categoryId: "decisoes-10",
  supportedAges: ["10-11"],
  generateChallenge: generateRiddlesChallenge,
  component: Riddles10Component
};
