---
title: Spanish Vocabulary Trainer
author: Joe Chu
toc: true
widgets:
  - position: left
    type: profile
    author: Joe Chu
    author_title: I like to keep knowledge and memories visible and readable.
    location: Fremont, CA
    avatar: /img/me.jpeg
    avatar_rounded: false
    gravatar: null
    follow_link: https://github.com/chuzcjoe
    social_links:
      Github:
        icon: fab fa-github
        url: https://github.com/chuzcjoe
      Linkedin:
        icon: fab fa-linkedin
        url: https://www.linkedin.com/in/joe-chu-1784b3179/
      Scholar:
        icon: fab fa-google
        url: https://scholar.google.com/citations?user=DCwJ1qcAAAAJ&hl=en
      Dribbble:
        icon: fab fa-dribbble
        url: https://dribbble.com
      RSS:
        icon: fas fa-rss
        url: /
  - position: left
    type: toc
    index: true
    collapsed: true
    depth: 3
  - position: left
    type: null
    links:
      Hexo: https://hexo.io
      Bulma: https://bulma.io
date: 2024-11-06 21:50:13
tags: [spanish]
categories:
- tool
---

Online Spanish vocabulary trainer. Covers 1000 basic words.

<!-- more -->

<div id="spanish-vocab-app">
  <style>
    .vocab-app {
      font-family: -apple-system, system-ui, sans-serif;
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .vocab-app .word-display {
      text-align: center;
      margin: 20px 0;
      min-height: 120px;
    }
    .vocab-app .spanish-word {
      font-size: 2.5em;
      font-weight: bold;
      margin: 10px 0;
    }
    .vocab-app .english-word {
      font-size: 1.8em;
      color: #666;
      margin: 10px 0;
    }
    .vocab-app .button-container {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin: 20px 0;
    }
    .vocab-app button {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1em;
      transition: all 0.2s ease;
    }
    .vocab-app button:hover {
      background-color: #0056b3;
    }
    .vocab-app button.outline {
      background-color: transparent;
      border: 1px solid #007bff;
      color: #007bff;
    }
    .vocab-app .progress {
      text-align: center;  /* Changed from right to center */
      font-size: 0.9em;
      color: #666;
      margin: 20px 0 10px 0;  /* Added more margin */
      padding: 0 10px;  /* Added padding */
      min-height: 20px;  /* Added minimum height */
    }
  </style>

  <div class="vocab-app">
    <h2 style="text-align: center;">Spanish Vocabulary Trainer</h2>
    <div class="word-display">
      <div id="vocab-spanish" class="spanish-word"></div>
      <div id="vocab-english" class="english-word" style="display: none;"></div>
    </div>
    <div class="button-container">
      <button id="vocab-toggle" class="outline">Show Translation</button>
      <button id="vocab-next">Next Word</button>
    </div>
    <div id="vocab-progress" class="progress"></div>
  </div>

  <script>
    (function() {
      const vocabulary = [
  {
    "spanish": "como",
    "english": "as"
  },
  {
    "spanish": "yo",
    "english": "I"
  },
  {
    "spanish": "su",
    "english": "his"
  },
  {
    "spanish": "que",
    "english": "that"
  },
  {
    "spanish": "él",
    "english": "he"
  },
  {
    "spanish": "era",
    "english": "was"
  },
  {
    "spanish": "para",
    "english": "for"
  },
  {
    "spanish": "en",
    "english": "on"
  },
  {
    "spanish": "son",
    "english": "are"
  },
  {
    "spanish": "con",
    "english": "with"
  },
  {
    "spanish": "ellos",
    "english": "they"
  },
  {
    "spanish": "ser",
    "english": "be"
  },
  {
    "spanish": "en",
    "english": "at"
  },
  {
    "spanish": "uno",
    "english": "one"
  },
  {
    "spanish": "tener",
    "english": "have"
  },
  {
    "spanish": "este",
    "english": "this"
  },
  {
    "spanish": "desde",
    "english": "from"
  },
  {
    "spanish": "por",
    "english": "by"
  },
  {
    "spanish": "caliente",
    "english": "hot"
  },
  {
    "spanish": "palabra",
    "english": "word"
  },
  {
    "spanish": "pero",
    "english": "but"
  },
  {
    "spanish": "qué",
    "english": "what"
  },
  {
    "spanish": "algunos",
    "english": "some"
  },
  {
    "spanish": "es",
    "english": "is"
  },
  {
    "spanish": "lo",
    "english": "it"
  },
  {
    "spanish": "usted",
    "english": "you"
  },
  {
    "spanish": "o",
    "english": "or"
  },
  {
    "spanish": "tenido",
    "english": "had"
  },
  {
    "spanish": "la",
    "english": "the"
  },
  {
    "spanish": "de",
    "english": "of"
  },
  {
    "spanish": "a",
    "english": "to"
  },
  {
    "spanish": "y",
    "english": "and"
  },
  {
    "spanish": "un",
    "english": "a"
  },
  {
    "spanish": "en",
    "english": "in"
  },
  {
    "spanish": "nos",
    "english": "we"
  },
  {
    "spanish": "lata",
    "english": "can"
  },
  {
    "spanish": "fuera",
    "english": "out"
  },
  {
    "spanish": "otros",
    "english": "other"
  },
  {
    "spanish": "eran",
    "english": "were"
  },
  {
    "spanish": "que",
    "english": "which"
  },
  {
    "spanish": "hacer",
    "english": "do"
  },
  {
    "spanish": "su",
    "english": "their"
  },
  {
    "spanish": "tiempo",
    "english": "time"
  },
  {
    "spanish": "si",
    "english": "if"
  },
  {
    "spanish": "lo hará",
    "english": "will"
  },
  {
    "spanish": "cómo",
    "english": "how"
  },
  {
    "spanish": "dicho",
    "english": "said"
  },
  {
    "spanish": "un",
    "english": "an"
  },
  {
    "spanish": "cada",
    "english": "each"
  },
  {
    "spanish": "decir",
    "english": "tell"
  },
  {
    "spanish": "hace",
    "english": "does"
  },
  {
    "spanish": "conjunto",
    "english": "set"
  },
  {
    "spanish": "tres",
    "english": "three"
  },
  {
    "spanish": "querer",
    "english": "want"
  },
  {
    "spanish": "aire",
    "english": "air"
  },
  {
    "spanish": "así",
    "english": "well"
  },
  {
    "spanish": "también",
    "english": "also"
  },
  {
    "spanish": "jugar",
    "english": "play"
  },
  {
    "spanish": "pequeño",
    "english": "small"
  },
  {
    "spanish": "fin",
    "english": "end"
  },
  {
    "spanish": "poner",
    "english": "put"
  },
  {
    "spanish": "casa",
    "english": "home"
  },
  {
    "spanish": "leer",
    "english": "read"
  },
  {
    "spanish": "mano",
    "english": "hand"
  },
  {
    "spanish": "puerto",
    "english": "port"
  },
  {
    "spanish": "grande",
    "english": "large"
  },
  {
    "spanish": "deletrear",
    "english": "spell"
  },
  {
    "spanish": "añadir",
    "english": "add"
  },
  {
    "spanish": "incluso",
    "english": "even"
  },
  {
    "spanish": "tierra",
    "english": "land"
  },
  {
    "spanish": "aquí",
    "english": "here"
  },
  {
    "spanish": "debe",
    "english": "must"
  },
  {
    "spanish": "grande",
    "english": "big"
  },
  {
    "spanish": "alto",
    "english": "high"
  },
  {
    "spanish": "tal",
    "english": "such"
  },
  {
    "spanish": "siga",
    "english": "follow"
  },
  {
    "spanish": "acto",
    "english": "act"
  },
  {
    "spanish": "por qué",
    "english": "why"
  },
  {
    "spanish": "preguntar",
    "english": "ask"
  },
  {
    "spanish": "hombres",
    "english": "men"
  },
  {
    "spanish": "cambio",
    "english": "change"
  },
  {
    "spanish": "se fue",
    "english": "went"
  },
  {
    "spanish": "luz",
    "english": "light"
  },
  {
    "spanish": "tipo",
    "english": "kind"
  },
  {
    "spanish": "fuera",
    "english": "off"
  },
  {
    "spanish": "necesitará",
    "english": "need"
  },
  {
    "spanish": "casa",
    "english": "house"
  },
  {
    "spanish": "imagen",
    "english": "picture"
  },
  {
    "spanish": "tratar",
    "english": "try"
  },
  {
    "spanish": "nosotros",
    "english": "us"
  },
  {
    "spanish": "de nuevo",
    "english": "again"
  },
  {
    "spanish": "animal",
    "english": "animal"
  },
  {
    "spanish": "punto",
    "english": "point"
  },
  {
    "spanish": "madre",
    "english": "mother"
  },
  {
    "spanish": "mundo",
    "english": "world"
  },
  {
    "spanish": "cerca",
    "english": "near"
  },
  {
    "spanish": "construir",
    "english": "build"
  },
  {
    "spanish": "auto",
    "english": "self"
  },
  {
    "spanish": "tierra",
    "english": "earth"
  },
  {
    "spanish": "padre",
    "english": "father"
  },
  {
    "spanish": "cualquier",
    "english": "any"
  },
  {
    "spanish": "nuevo",
    "english": "new"
  },
  {
    "spanish": "trabajo",
    "english": "work"
  },
  {
    "spanish": "parte",
    "english": "part"
  },
  {
    "spanish": "tomar",
    "english": "take"
  },
  {
    "spanish": "conseguir",
    "english": "get"
  },
  {
    "spanish": "lugar",
    "english": "place"
  },
  {
    "spanish": "hecho",
    "english": "made"
  },
  {
    "spanish": "vivir",
    "english": "live"
  },
  {
    "spanish": "donde",
    "english": "where"
  },
  {
    "spanish": "después",
    "english": "after"
  },
  {
    "spanish": "espalda",
    "english": "back"
  },
  {
    "spanish": "poco",
    "english": "little"
  },
  {
    "spanish": "sólo",
    "english": "only"
  },
  {
    "spanish": "ronda",
    "english": "round"
  },
  {
    "spanish": "hombre",
    "english": "man"
  },
  {
    "spanish": "años",
    "english": "year"
  },
  {
    "spanish": "vino",
    "english": "came"
  },
  {
    "spanish": "show",
    "english": "show"
  },
  {
    "spanish": "cada",
    "english": "every"
  },
  {
    "spanish": "buena",
    "english": "good"
  },
  {
    "spanish": "me",
    "english": "me"
  },
  {
    "spanish": "dar",
    "english": "give"
  },
  {
    "spanish": "nuestro",
    "english": "our"
  },
  {
    "spanish": "bajo",
    "english": "under"
  },
  {
    "spanish": "nombre",
    "english": "name"
  },
  {
    "spanish": "muy",
    "english": "very"
  },
  {
    "spanish": "a través de",
    "english": "through"
  },
  {
    "spanish": "sólo",
    "english": "just"
  },
  {
    "spanish": "forma",
    "english": "form"
  },
  {
    "spanish": "frase",
    "english": "sentence"
  },
  {
    "spanish": "gran",
    "english": "great"
  },
  {
    "spanish": "pensar",
    "english": "think"
  },
  {
    "spanish": "decir",
    "english": "say"
  },
  {
    "spanish": "ayudar",
    "english": "help"
  },
  {
    "spanish": "bajo",
    "english": "low"
  },
  {
    "spanish": "línea",
    "english": "line"
  },
  {
    "spanish": "ser distinto",
    "english": "differ"
  },
  {
    "spanish": "a su vez,",
    "english": "turn"
  },
  {
    "spanish": "causa",
    "english": "cause"
  },
  {
    "spanish": "mucho",
    "english": "much"
  },
  {
    "spanish": "significará",
    "english": "mean"
  },
  {
    "spanish": "antes",
    "english": "before"
  },
  {
    "spanish": "movimiento",
    "english": "move"
  },
  {
    "spanish": "derecho",
    "english": "right"
  },
  {
    "spanish": "niño",
    "english": "boy"
  },
  {
    "spanish": "viejo",
    "english": "old"
  },
  {
    "spanish": "demasiado",
    "english": "too"
  },
  {
    "spanish": "misma",
    "english": "same"
  },
  {
    "spanish": "ella",
    "english": "she"
  },
  {
    "spanish": "todo",
    "english": "all"
  },
  {
    "spanish": "hay",
    "english": "there"
  },
  {
    "spanish": "cuando",
    "english": "when"
  },
  {
    "spanish": "hasta",
    "english": "up"
  },
  {
    "spanish": "uso",
    "english": "use"
  },
  {
    "spanish": "su",
    "english": "your"
  },
  {
    "spanish": "camino",
    "english": "way"
  },
  {
    "spanish": "acerca",
    "english": "about"
  },
  {
    "spanish": "muchos",
    "english": "many"
  },
  {
    "spanish": "entonces",
    "english": "then"
  },
  {
    "spanish": "ellos",
    "english": "them"
  },
  {
    "spanish": "escribir",
    "english": "write"
  },
  {
    "spanish": "haría",
    "english": "would"
  },
  {
    "spanish": "como",
    "english": "like"
  },
  {
    "spanish": "así",
    "english": "so"
  },
  {
    "spanish": "éstos",
    "english": "these"
  },
  {
    "spanish": "su",
    "english": "her"
  },
  {
    "spanish": "largo",
    "english": "long"
  },
  {
    "spanish": "hacer",
    "english": "make"
  },
  {
    "spanish": "cosa",
    "english": "thing"
  },
  {
    "spanish": "ver",
    "english": "see"
  },
  {
    "spanish": "él",
    "english": "him"
  },
  {
    "spanish": "dos",
    "english": "two"
  },
  {
    "spanish": "tiene",
    "english": "has"
  },
  {
    "spanish": "buscar",
    "english": "look"
  },
  {
    "spanish": "más",
    "english": "more"
  },
  {
    "spanish": "día",
    "english": "day"
  },
  {
    "spanish": "podía",
    "english": "could"
  },
  {
    "spanish": "ir",
    "english": "go"
  },
  {
    "spanish": "venir",
    "english": "come"
  },
  {
    "spanish": "hizo",
    "english": "did"
  },
  {
    "spanish": "número",
    "english": "number"
  },
  {
    "spanish": "sonar",
    "english": "sound"
  },
  {
    "spanish": "no",
    "english": "no"
  },
  {
    "spanish": "más",
    "english": "most"
  },
  {
    "spanish": "personas",
    "english": "people"
  },
  {
    "spanish": "mi",
    "english": "my"
  },
  {
    "spanish": "sobre",
    "english": "over"
  },
  {
    "spanish": "saber",
    "english": "know"
  },
  {
    "spanish": "agua",
    "english": "water"
  },
  {
    "spanish": "que",
    "english": "than"
  },
  {
    "spanish": "llamada",
    "english": "call"
  },
  {
    "spanish": "primero",
    "english": "first"
  },
  {
    "spanish": "que",
    "english": "who"
  },
  {
    "spanish": "puede",
    "english": "may"
  },
  {
    "spanish": "abajo",
    "english": "down"
  },
  {
    "spanish": "lado",
    "english": "side"
  },
  {
    "spanish": "estado",
    "english": "been"
  },
  {
    "spanish": "ahora",
    "english": "now"
  },
  {
    "spanish": "encontrar",
    "english": "find"
  },
  {
    "spanish": "cabeza",
    "english": "head"
  },
  {
    "spanish": "de pie",
    "english": "stand"
  },
  {
    "spanish": "propio",
    "english": "own"
  },
  {
    "spanish": "página",
    "english": "page"
  },
  {
    "spanish": "debería",
    "english": "should"
  },
  {
    "spanish": "país",
    "english": "country"
  },
  {
    "spanish": "encontrado",
    "english": "found"
  },
  {
    "spanish": "respuesta",
    "english": "answer"
  },
  {
    "spanish": "escuela",
    "english": "school"
  },
  {
    "spanish": "crecer",
    "english": "grow"
  },
  {
    "spanish": "estudio",
    "english": "study"
  },
  {
    "spanish": "todavía",
    "english": "still"
  },
  {
    "spanish": "aprender",
    "english": "learn"
  },
  {
    "spanish": "planta",
    "english": "plant"
  },
  {
    "spanish": "cubierta",
    "english": "cover"
  },
  {
    "spanish": "alimentos",
    "english": "food"
  },
  {
    "spanish": "sol",
    "english": "sun"
  },
  {
    "spanish": "cuatro",
    "english": "four"
  },
  {
    "spanish": "entre",
    "english": "between"
  },
  {
    "spanish": "estado",
    "english": "state"
  },
  {
    "spanish": "mantener",
    "english": "keep"
  },
  {
    "spanish": "ojo",
    "english": "eye"
  },
  {
    "spanish": "nunca",
    "english": "never"
  },
  {
    "spanish": "último",
    "english": "last"
  },
  {
    "spanish": "dejar",
    "english": "let"
  },
  {
    "spanish": "pensado",
    "english": "thought"
  },
  {
    "spanish": "ciudad",
    "english": "city"
  },
  {
    "spanish": "árbol",
    "english": "tree"
  },
  {
    "spanish": "cruzar",
    "english": "cross"
  },
  {
    "spanish": "granja",
    "english": "farm"
  },
  {
    "spanish": "duro",
    "english": "hard"
  },
  {
    "spanish": "inicio",
    "english": "start"
  },
  {
    "spanish": "podría",
    "english": "might"
  },
  {
    "spanish": "historia",
    "english": "story"
  },
  {
    "spanish": "sierra",
    "english": "saw"
  },
  {
    "spanish": "ahora",
    "english": "far"
  },
  {
    "spanish": "mar",
    "english": "sea"
  },
  {
    "spanish": "dibujar",
    "english": "draw"
  },
  {
    "spanish": "izquierda",
    "english": "left"
  },
  {
    "spanish": "tarde",
    "english": "late"
  },
  {
    "spanish": "ejecutar",
    "english": "run"
  },
  {
    "spanish": "no",
    "english": "don’t"
  },
  {
    "spanish": "mientras",
    "english": "while"
  },
  {
    "spanish": "prensa",
    "english": "press"
  },
  {
    "spanish": "Cerrar",
    "english": "close"
  },
  {
    "spanish": "noche",
    "english": "night"
  },
  {
    "spanish": "reales",
    "english": "real"
  },
  {
    "spanish": "vida",
    "english": "life"
  },
  {
    "spanish": "pocos",
    "english": "few"
  },
  {
    "spanish": "norte",
    "english": "north"
  },
  {
    "spanish": "libro",
    "english": "book"
  },
  {
    "spanish": "llevar",
    "english": "carry"
  },
  {
    "spanish": "tomó",
    "english": "took"
  },
  {
    "spanish": "ciencia",
    "english": "science"
  },
  {
    "spanish": "comer",
    "english": "eat"
  },
  {
    "spanish": "habitación",
    "english": "room"
  },
  {
    "spanish": "amigo",
    "english": "friend"
  },
  {
    "spanish": "comenzó",
    "english": "began"
  },
  {
    "spanish": "gusta",
    "english": "idea"
  },
  {
    "spanish": "peces",
    "english": "fish"
  },
  {
    "spanish": "montaña",
    "english": "mountain"
  },
  {
    "spanish": "Deténgase",
    "english": "stop"
  },
  {
    "spanish": "una vez",
    "english": "once"
  },
  {
    "spanish": "base de",
    "english": "base"
  },
  {
    "spanish": "escuchar",
    "english": "hear"
  },
  {
    "spanish": "caballo",
    "english": "horse"
  },
  {
    "spanish": "cortada",
    "english": "cut"
  },
  {
    "spanish": "seguro",
    "english": "sure"
  },
  {
    "spanish": "ver",
    "english": "watch"
  },
  {
    "spanish": "colores",
    "english": "color"
  },
  {
    "spanish": "cara",
    "english": "face"
  },
  {
    "spanish": "madera",
    "english": "wood"
  },
  {
    "spanish": "principal",
    "english": "main"
  },
  {
    "spanish": "abierta",
    "english": "open"
  },
  {
    "spanish": "parecer",
    "english": "seem"
  },
  {
    "spanish": "juntos",
    "english": "together"
  },
  {
    "spanish": "próximo",
    "english": "next"
  },
  {
    "spanish": "blanco",
    "english": "white"
  },
  {
    "spanish": "niños",
    "english": "children"
  },
  {
    "spanish": "comenzar",
    "english": "begin"
  },
  {
    "spanish": "conseguido",
    "english": "got"
  },
  {
    "spanish": "caminar",
    "english": "walk"
  },
  {
    "spanish": "ejemplo",
    "english": "example"
  },
  {
    "spanish": "aliviar",
    "english": "ease"
  },
  {
    "spanish": "papel",
    "english": "paper"
  },
  {
    "spanish": "grupo",
    "english": "group"
  },
  {
    "spanish": "siempre",
    "english": "always"
  },
  {
    "spanish": "música",
    "english": "music"
  },
  {
    "spanish": "los",
    "english": "those"
  },
  {
    "spanish": "ambos",
    "english": "both"
  },
  {
    "spanish": "marca",
    "english": "mark"
  },
  {
    "spanish": "menudo",
    "english": "often"
  },
  {
    "spanish": "carta",
    "english": "letter"
  },
  {
    "spanish": "hasta",
    "english": "until"
  },
  {
    "spanish": "milla",
    "english": "mile"
  },
  {
    "spanish": "río",
    "english": "river"
  },
  {
    "spanish": "coche",
    "english": "car"
  },
  {
    "spanish": "pies",
    "english": "feet"
  },
  {
    "spanish": "cuidado",
    "english": "care"
  },
  {
    "spanish": "segundo",
    "english": "second"
  },
  {
    "spanish": "suficiente",
    "english": "enough"
  },
  {
    "spanish": "llano",
    "english": "plain"
  },
  {
    "spanish": "chica",
    "english": "girl"
  },
  {
    "spanish": "habitual",
    "english": "usual"
  },
  {
    "spanish": "joven",
    "english": "young"
  },
  {
    "spanish": "listo",
    "english": "ready"
  },
  {
    "spanish": "por encima de",
    "english": "above"
  },
  {
    "spanish": "nunca",
    "english": "ever"
  },
  {
    "spanish": "rojo",
    "english": "red"
  },
  {
    "spanish": "lista",
    "english": "list"
  },
  {
    "spanish": "aunque",
    "english": "though"
  },
  {
    "spanish": "sentir",
    "english": "feel"
  },
  {
    "spanish": "charla",
    "english": "talk"
  },
  {
    "spanish": "pájaro",
    "english": "bird"
  },
  {
    "spanish": "pronto",
    "english": "soon"
  },
  {
    "spanish": "cuerpo",
    "english": "body"
  },
  {
    "spanish": "perro",
    "english": "dog"
  },
  {
    "spanish": "familia",
    "english": "family"
  },
  {
    "spanish": "directa",
    "english": "direct"
  },
  {
    "spanish": "plantear",
    "english": "pose"
  },
  {
    "spanish": "dejar",
    "english": "leave"
  },
  {
    "spanish": "canción",
    "english": "song"
  },
  {
    "spanish": "medir",
    "english": "measure"
  },
  {
    "spanish": "puerta",
    "english": "door"
  },
  {
    "spanish": "producto",
    "english": "product"
  },
  {
    "spanish": "negro",
    "english": "black"
  },
  {
    "spanish": "corto",
    "english": "short"
  },
  {
    "spanish": "numeral",
    "english": "numeral"
  },
  {
    "spanish": "clase",
    "english": "class"
  },
  {
    "spanish": "viento",
    "english": "wind"
  },
  {
    "spanish": "pregunta",
    "english": "question"
  },
  {
    "spanish": "suceder",
    "english": "happen"
  },
  {
    "spanish": "completo",
    "english": "complete"
  },
  {
    "spanish": "buque",
    "english": "ship"
  },
  {
    "spanish": "zona",
    "english": "area"
  },
  {
    "spanish": "medio",
    "english": "half"
  },
  {
    "spanish": "roca",
    "english": "rock"
  },
  {
    "spanish": "orden",
    "english": "order"
  },
  {
    "spanish": "fuego",
    "english": "fire"
  },
  {
    "spanish": "sur",
    "english": "south"
  },
  {
    "spanish": "problema",
    "english": "problem"
  },
  {
    "spanish": "pieza",
    "english": "piece"
  },
  {
    "spanish": "dicho",
    "english": "told"
  },
  {
    "spanish": "sabía",
    "english": "knew"
  },
  {
    "spanish": "pasar",
    "english": "pass"
  },
  {
    "spanish": "desde",
    "english": "since"
  },
  {
    "spanish": "cima",
    "english": "top"
  },
  {
    "spanish": "todo",
    "english": "whole"
  },
  {
    "spanish": "rey",
    "english": "king"
  },
  {
    "spanish": "calle",
    "english": "street"
  },
  {
    "spanish": "pulgadas",
    "english": "inch"
  },
  {
    "spanish": "multiplicar",
    "english": "multiply"
  },
  {
    "spanish": "nada",
    "english": "nothing"
  },
  {
    "spanish": "curso",
    "english": "course"
  },
  {
    "spanish": "quedarse",
    "english": "stay"
  },
  {
    "spanish": "rueda",
    "english": "wheel"
  },
  {
    "spanish": "completo",
    "english": "full"
  },
  {
    "spanish": "fuerza",
    "english": "force"
  },
  {
    "spanish": "azul",
    "english": "blue"
  },
  {
    "spanish": "objeto",
    "english": "object"
  },
  {
    "spanish": "decidir",
    "english": "decide"
  },
  {
    "spanish": "superficie",
    "english": "surface"
  },
  {
    "spanish": "profunda",
    "english": "deep"
  },
  {
    "spanish": "luna",
    "english": "moon"
  },
  {
    "spanish": "isla",
    "english": "island"
  },
  {
    "spanish": "pie",
    "english": "foot"
  },
  {
    "spanish": "sistema",
    "english": "system"
  },
  {
    "spanish": "ocupado",
    "english": "busy"
  },
  {
    "spanish": "prueba",
    "english": "test"
  },
  {
    "spanish": "registro",
    "english": "record"
  },
  {
    "spanish": "barco",
    "english": "boat"
  },
  {
    "spanish": "común",
    "english": "common"
  },
  {
    "spanish": "oro",
    "english": "gold"
  },
  {
    "spanish": "posible",
    "english": "possible"
  },
  {
    "spanish": "plano",
    "english": "plane"
  },
  {
    "spanish": "lugar",
    "english": "stead"
  },
  {
    "spanish": "seco",
    "english": "dry"
  },
  {
    "spanish": "maravilla",
    "english": "wonder"
  },
  {
    "spanish": "risa",
    "english": "laugh"
  },
  {
    "spanish": "mil",
    "english": "thousand"
  },
  {
    "spanish": "hace",
    "english": "ago"
  },
  {
    "spanish": "corrió",
    "english": "ran"
  },
  {
    "spanish": "comprobar",
    "english": "check"
  },
  {
    "spanish": "juego",
    "english": "game"
  },
  {
    "spanish": "forma",
    "english": "shape"
  },
  {
    "spanish": "equiparar",
    "english": "equate"
  },
  {
    "spanish": "caliente",
    "english": "hot"
  },
  {
    "spanish": "señorita",
    "english": "miss"
  },
  {
    "spanish": "traído",
    "english": "brought"
  },
  {
    "spanish": "calor",
    "english": "heat"
  },
  {
    "spanish": "nieve",
    "english": "snow"
  },
  {
    "spanish": "neumáticos",
    "english": "tire"
  },
  {
    "spanish": "traer",
    "english": "bring"
  },
  {
    "spanish": "sí",
    "english": "yes"
  },
  {
    "spanish": "distante",
    "english": "distant"
  },
  {
    "spanish": "llenar",
    "english": "fill"
  },
  {
    "spanish": "al este",
    "english": "east"
  },
  {
    "spanish": "pintar",
    "english": "paint"
  },
  {
    "spanish": "idioma",
    "english": "language"
  },
  {
    "spanish": "entre",
    "english": "among"
  },
  {
    "spanish": "unidad",
    "english": "unit"
  },
  {
    "spanish": "potencia",
    "english": "power"
  },
  {
    "spanish": "ciudad",
    "english": "town"
  },
  {
    "spanish": "fina",
    "english": "fine"
  },
  {
    "spanish": "cierto",
    "english": "certain"
  },
  {
    "spanish": "volar",
    "english": "fly"
  },
  {
    "spanish": "caer",
    "english": "fall"
  },
  {
    "spanish": "conducir",
    "english": "lead"
  },
  {
    "spanish": "grito",
    "english": "cry"
  },
  {
    "spanish": "oscuro",
    "english": "dark"
  },
  {
    "spanish": "máquina",
    "english": "machine"
  },
  {
    "spanish": "nota",
    "english": "note"
  },
  {
    "spanish": "espere",
    "english": "wait"
  },
  {
    "spanish": "plan de",
    "english": "plan"
  },
  {
    "spanish": "figura",
    "english": "figure"
  },
  {
    "spanish": "estrella",
    "english": "star"
  },
  {
    "spanish": "caja",
    "english": "box"
  },
  {
    "spanish": "sustantivo",
    "english": "noun"
  },
  {
    "spanish": "campo",
    "english": "field"
  },
  {
    "spanish": "resto",
    "english": "rest"
  },
  {
    "spanish": "correcta",
    "english": "correct"
  },
  {
    "spanish": "capaz",
    "english": "able"
  },
  {
    "spanish": "libra",
    "english": "pound"
  },
  {
    "spanish": "hecho",
    "english": "done"
  },
  {
    "spanish": "belleza",
    "english": "beauty"
  },
  {
    "spanish": "unidad",
    "english": "drive"
  },
  {
    "spanish": "destacado",
    "english": "stood"
  },
  {
    "spanish": "contener",
    "english": "contain"
  },
  {
    "spanish": "delante",
    "english": "front"
  },
  {
    "spanish": "enseñar",
    "english": "teach"
  },
  {
    "spanish": "semana",
    "english": "week"
  },
  {
    "spanish": "último",
    "english": "final"
  },
  {
    "spanish": "dio",
    "english": "gave"
  },
  {
    "spanish": "verde",
    "english": "green"
  },
  {
    "spanish": "oh",
    "english": "oh"
  },
  {
    "spanish": "rápido",
    "english": "quick"
  },
  {
    "spanish": "desarrollar",
    "english": "develop"
  },
  {
    "spanish": "océano",
    "english": "ocean"
  },
  {
    "spanish": "caliente",
    "english": "warm"
  },
  {
    "spanish": "libre",
    "english": "free"
  },
  {
    "spanish": "minuto",
    "english": "minute"
  },
  {
    "spanish": "fuerte",
    "english": "strong"
  },
  {
    "spanish": "especial",
    "english": "special"
  },
  {
    "spanish": "mente",
    "english": "mind"
  },
  {
    "spanish": "detrás",
    "english": "behind"
  },
  {
    "spanish": "claro",
    "english": "clear"
  },
  {
    "spanish": "cola",
    "english": "tail"
  },
  {
    "spanish": "Produce",
    "english": "produce"
  },
  {
    "spanish": "hecho",
    "english": "fact"
  },
  {
    "spanish": "espacio",
    "english": "space"
  },
  {
    "spanish": "oído",
    "english": "heard"
  },
  {
    "spanish": "mejor",
    "english": "best"
  },
  {
    "spanish": "horas",
    "english": "hour"
  },
  {
    "spanish": "mejor",
    "english": "better"
  },
  {
    "spanish": "verdadero",
    "english": true
  },
  {
    "spanish": "durante",
    "english": "during"
  },
  {
    "spanish": "cien",
    "english": "hundred"
  },
  {
    "spanish": "cinco",
    "english": "five"
  },
  {
    "spanish": "recordar",
    "english": "remember"
  },
  {
    "spanish": "paso",
    "english": "step"
  },
  {
    "spanish": "temprana",
    "english": "early"
  },
  {
    "spanish": "mantenga",
    "english": "hold"
  },
  {
    "spanish": "oeste",
    "english": "west"
  },
  {
    "spanish": "suelo",
    "english": "ground"
  },
  {
    "spanish": "interés",
    "english": "interest"
  },
  {
    "spanish": "llegar",
    "english": "reach"
  },
  {
    "spanish": "rápido",
    "english": "fast"
  },
  {
    "spanish": "verbo",
    "english": "verb"
  },
  {
    "spanish": "cantar",
    "english": "sing"
  },
  {
    "spanish": "escuchar",
    "english": "listen"
  },
  {
    "spanish": "seis",
    "english": "six"
  },
  {
    "spanish": "mesa",
    "english": "table"
  },
  {
    "spanish": "viajes",
    "english": "travel"
  },
  {
    "spanish": "menos",
    "english": "less"
  },
  {
    "spanish": "mañana",
    "english": "morning"
  },
  {
    "spanish": "diez",
    "english": "ten"
  },
  {
    "spanish": "sencilla",
    "english": "simple"
  },
  {
    "spanish": "varios",
    "english": "several"
  },
  {
    "spanish": "vocal",
    "english": "vowel"
  },
  {
    "spanish": "hacia",
    "english": "toward"
  },
  {
    "spanish": "guerra",
    "english": "war"
  },
  {
    "spanish": "sentar",
    "english": "lay"
  },
  {
    "spanish": "contra",
    "english": "against"
  },
  {
    "spanish": "patrón",
    "english": "pattern"
  },
  {
    "spanish": "lenta",
    "english": "slow"
  },
  {
    "spanish": "centro",
    "english": "center"
  },
  {
    "spanish": "amar",
    "english": "love"
  },
  {
    "spanish": "persona",
    "english": "person"
  },
  {
    "spanish": "dinero",
    "english": "money"
  },
  {
    "spanish": "servir",
    "english": "serve"
  },
  {
    "spanish": "aparecerá",
    "english": "appear"
  },
  {
    "spanish": "carretera",
    "english": "road"
  },
  {
    "spanish": "mapa",
    "english": "map"
  },
  {
    "spanish": "lluvia",
    "english": "rain"
  },
  {
    "spanish": "regla",
    "english": "rule"
  },
  {
    "spanish": "gobernar",
    "english": "govern"
  },
  {
    "spanish": "Halar",
    "english": "pull"
  },
  {
    "spanish": "frío",
    "english": "cold"
  },
  {
    "spanish": "aviso",
    "english": "notice"
  },
  {
    "spanish": "voz",
    "english": "voice"
  },
  {
    "spanish": "energía",
    "english": "energy"
  },
  {
    "spanish": "caza",
    "english": "hunt"
  },
  {
    "spanish": "probable",
    "english": "probable"
  },
  {
    "spanish": "cama",
    "english": "bed"
  },
  {
    "spanish": "hermano",
    "english": "brother"
  },
  {
    "spanish": "huevo",
    "english": "egg"
  },
  {
    "spanish": "paseo",
    "english": "ride"
  },
  {
    "spanish": "celular",
    "english": "cell"
  },
  {
    "spanish": "creer",
    "english": "believe"
  },
  {
    "spanish": "quizás",
    "english": "perhaps"
  },
  {
    "spanish": "recoger",
    "english": "pick"
  },
  {
    "spanish": "repentina",
    "english": "sudden"
  },
  {
    "spanish": "contar",
    "english": "count"
  },
  {
    "spanish": "plaza",
    "english": "square"
  },
  {
    "spanish": "razón",
    "english": "reason"
  },
  {
    "spanish": "longitud",
    "english": "length"
  },
  {
    "spanish": "representar",
    "english": "represent"
  },
  {
    "spanish": "arte",
    "english": "art"
  },
  {
    "spanish": "sujeto",
    "english": "subject"
  },
  {
    "spanish": "región",
    "english": "region"
  },
  {
    "spanish": "tamaño",
    "english": "size"
  },
  {
    "spanish": "variar",
    "english": "vary"
  },
  {
    "spanish": "resolver",
    "english": "settle"
  },
  {
    "spanish": "hablar",
    "english": "speak"
  },
  {
    "spanish": "peso",
    "english": "weight"
  },
  {
    "spanish": "general",
    "english": "general"
  },
  {
    "spanish": "hielo",
    "english": "ice"
  },
  {
    "spanish": "materia",
    "english": "matter"
  },
  {
    "spanish": "círculo",
    "english": "circle"
  },
  {
    "spanish": "par",
    "english": "pair"
  },
  {
    "spanish": "incluir",
    "english": "include"
  },
  {
    "spanish": "brecha",
    "english": "divide"
  },
  {
    "spanish": "sílaba",
    "english": "syllable"
  },
  {
    "spanish": "sentido",
    "english": "felt"
  },
  {
    "spanish": "gran",
    "english": "grand"
  },
  {
    "spanish": "bola",
    "english": "ball"
  },
  {
    "spanish": "aún",
    "english": "yet"
  },
  {
    "spanish": "ola",
    "english": "wave"
  },
  {
    "spanish": "caer",
    "english": "drop"
  },
  {
    "spanish": "corazón",
    "english": "heart"
  },
  {
    "spanish": "am",
    "english": "am"
  },
  {
    "spanish": "presente",
    "english": "present"
  },
  {
    "spanish": "pesada",
    "english": "heavy"
  },
  {
    "spanish": "danza",
    "english": "dance"
  },
  {
    "spanish": "motor",
    "english": "engine"
  },
  {
    "spanish": "posición",
    "english": "position"
  },
  {
    "spanish": "brazo",
    "english": "arm"
  },
  {
    "spanish": "amplio",
    "english": "wide"
  },
  {
    "spanish": "vela",
    "english": "sail"
  },
  {
    "spanish": "materiales",
    "english": "material"
  },
  {
    "spanish": "fracción",
    "english": "fraction"
  },
  {
    "spanish": "bosque",
    "english": "forest"
  },
  {
    "spanish": "sentarse",
    "english": "sit"
  },
  {
    "spanish": "carrera",
    "english": "race"
  },
  {
    "spanish": "ventana",
    "english": "window"
  },
  {
    "spanish": "tienda",
    "english": "store"
  },
  {
    "spanish": "verano",
    "english": "summer"
  },
  {
    "spanish": "tren",
    "english": "train"
  },
  {
    "spanish": "sueño",
    "english": "sleep"
  },
  {
    "spanish": "demostrar",
    "english": "prove"
  },
  {
    "spanish": "solitario",
    "english": "lone"
  },
  {
    "spanish": "pierna",
    "english": "leg"
  },
  {
    "spanish": "ejercicio",
    "english": "exercise"
  },
  {
    "spanish": "pared",
    "english": "wall"
  },
  {
    "spanish": "capturas",
    "english": "catch"
  },
  {
    "spanish": "monte",
    "english": "mount"
  },
  {
    "spanish": "desear",
    "english": "wish"
  },
  {
    "spanish": "cielo",
    "english": "sky"
  },
  {
    "spanish": "bordo",
    "english": "board"
  },
  {
    "spanish": "alegría",
    "english": "joy"
  },
  {
    "spanish": "invierno",
    "english": "winter"
  },
  {
    "spanish": "satélite",
    "english": "sat"
  },
  {
    "spanish": "escrito",
    "english": "written"
  },
  {
    "spanish": "salvaje",
    "english": "wild"
  },
  {
    "spanish": "instrumento",
    "english": "instrument"
  },
  {
    "spanish": "guardado",
    "english": "kept"
  },
  {
    "spanish": "vidrio",
    "english": "glass"
  },
  {
    "spanish": "hierba",
    "english": "grass"
  },
  {
    "spanish": "vaca",
    "english": "cow"
  },
  {
    "spanish": "trabajo",
    "english": "job"
  },
  {
    "spanish": "borde",
    "english": "edge"
  },
  {
    "spanish": "signo",
    "english": "sign"
  },
  {
    "spanish": "visita",
    "english": "visit"
  },
  {
    "spanish": "pasado",
    "english": "past"
  },
  {
    "spanish": "suave",
    "english": "soft"
  },
  {
    "spanish": "diversión",
    "english": "fun"
  },
  {
    "spanish": "brillante",
    "english": "bright"
  },
  {
    "spanish": "gas",
    "english": "gas"
  },
  {
    "spanish": "tiempo",
    "english": "weather"
  },
  {
    "spanish": "mes",
    "english": "month"
  },
  {
    "spanish": "millones",
    "english": "million"
  },
  {
    "spanish": "soportar",
    "english": "bear"
  },
  {
    "spanish": "acabado",
    "english": "finish"
  },
  {
    "spanish": "feliz",
    "english": "happy"
  },
  {
    "spanish": "esperanza",
    "english": "hope"
  },
  {
    "spanish": "flor",
    "english": "flower"
  },
  {
    "spanish": "vestir",
    "english": "clothe"
  },
  {
    "spanish": "extraño",
    "english": "strange"
  },
  {
    "spanish": "se ha ido",
    "english": "gone"
  },
  {
    "spanish": "comercio",
    "english": "trade"
  },
  {
    "spanish": "melodía",
    "english": "melody"
  },
  {
    "spanish": "viaje",
    "english": "trip"
  },
  {
    "spanish": "oficina",
    "english": "office"
  },
  {
    "spanish": "recibir",
    "english": "receive"
  },
  {
    "spanish": "fila",
    "english": "row"
  },
  {
    "spanish": "boca",
    "english": "mouth"
  },
  {
    "spanish": "exacta",
    "english": "exact"
  },
  {
    "spanish": "símbolo",
    "english": "symbol"
  },
  {
    "spanish": "morir",
    "english": "die"
  },
  {
    "spanish": "menos",
    "english": "least"
  },
  {
    "spanish": "problema",
    "english": "trouble"
  },
  {
    "spanish": "grito",
    "english": "shout"
  },
  {
    "spanish": "excepto",
    "english": "except"
  },
  {
    "spanish": "escribió",
    "english": "wrote"
  },
  {
    "spanish": "semilla",
    "english": "seed"
  },
  {
    "spanish": "tono",
    "english": "tone"
  },
  {
    "spanish": "unirse",
    "english": "join"
  },
  {
    "spanish": "sugerir",
    "english": "suggest"
  },
  {
    "spanish": "limpia",
    "english": "clean"
  },
  {
    "spanish": "rotura",
    "english": "break"
  },
  {
    "spanish": "dama",
    "english": "lady"
  },
  {
    "spanish": "patio",
    "english": "yard"
  },
  {
    "spanish": "aumentando",
    "english": "rise"
  },
  {
    "spanish": "mal",
    "english": "bad"
  },
  {
    "spanish": "golpe",
    "english": "blow"
  },
  {
    "spanish": "aceite",
    "english": "oil"
  },
  {
    "spanish": "sangre",
    "english": "blood"
  },
  {
    "spanish": "tocar",
    "english": "touch"
  },
  {
    "spanish": "creció",
    "english": "grew"
  },
  {
    "spanish": "ciento",
    "english": "cent"
  },
  {
    "spanish": "mezclar",
    "english": "mix"
  },
  {
    "spanish": "equipo",
    "english": "team"
  },
  {
    "spanish": "alambre",
    "english": "wire"
  },
  {
    "spanish": "costo",
    "english": "cost"
  },
  {
    "spanish": "perdido",
    "english": "lost"
  },
  {
    "spanish": "marrón",
    "english": "brown"
  },
  {
    "spanish": "desgaste",
    "english": "wear"
  },
  {
    "spanish": "jardín",
    "english": "garden"
  },
  {
    "spanish": "igual",
    "english": "equal"
  },
  {
    "spanish": "enviado",
    "english": "sent"
  },
  {
    "spanish": "elegir",
    "english": "choose"
  },
  {
    "spanish": "cayó",
    "english": "fell"
  },
  {
    "spanish": "encajar",
    "english": "fit"
  },
  {
    "spanish": "fluir",
    "english": "flow"
  },
  {
    "spanish": "justo",
    "english": "fair"
  },
  {
    "spanish": "banco",
    "english": "bank"
  },
  {
    "spanish": "recoger",
    "english": "collect"
  },
  {
    "spanish": "guardar",
    "english": "save"
  },
  {
    "spanish": "el control",
    "english": "control"
  },
  {
    "spanish": "decimal",
    "english": "decimal"
  },
  {
    "spanish": "oído",
    "english": "ear"
  },
  {
    "spanish": "demás",
    "english": "else"
  },
  {
    "spanish": "bastante",
    "english": "quite"
  },
  {
    "spanish": "rompió",
    "english": "broke"
  },
  {
    "spanish": "caso",
    "english": "case"
  },
  {
    "spanish": "medio",
    "english": "middle"
  },
  {
    "spanish": "matar",
    "english": "kill"
  },
  {
    "spanish": "hijo",
    "english": "son"
  },
  {
    "spanish": "lago",
    "english": "lake"
  },
  {
    "spanish": "momento",
    "english": "moment"
  },
  {
    "spanish": "escala",
    "english": "scale"
  },
  {
    "spanish": "fuerte",
    "english": "loud"
  },
  {
    "spanish": "primavera",
    "english": "spring"
  },
  {
    "spanish": "observar",
    "english": "observe"
  },
  {
    "spanish": "niño",
    "english": "child"
  },
  {
    "spanish": "recta",
    "english": "straight"
  },
  {
    "spanish": "consonante",
    "english": "consonant"
  },
  {
    "spanish": "nación",
    "english": "nation"
  },
  {
    "spanish": "diccionario",
    "english": "dictionary"
  },
  {
    "spanish": "leche",
    "english": "milk"
  },
  {
    "spanish": "velocidad",
    "english": "speed"
  },
  {
    "spanish": "método",
    "english": "method"
  },
  {
    "spanish": "órgano",
    "english": "organ"
  },
  {
    "spanish": "pagar",
    "english": "pay"
  },
  {
    "spanish": "edad",
    "english": "age"
  },
  {
    "spanish": "sección",
    "english": "section"
  },
  {
    "spanish": "vestido",
    "english": "dress"
  },
  {
    "spanish": "nube",
    "english": "cloud"
  },
  {
    "spanish": "sorpresa",
    "english": "surprise"
  },
  {
    "spanish": "tranquila",
    "english": "quiet"
  },
  {
    "spanish": "piedra",
    "english": "stone"
  },
  {
    "spanish": "pequeño",
    "english": "tiny"
  },
  {
    "spanish": "ascenso",
    "english": "climb"
  },
  {
    "spanish": "fresco",
    "english": "cool"
  },
  {
    "spanish": "diseño",
    "english": "design"
  },
  {
    "spanish": "pobre",
    "english": "poor"
  },
  {
    "spanish": "mucho",
    "english": "lot"
  },
  {
    "spanish": "experimento",
    "english": "experiment"
  },
  {
    "spanish": "inferior",
    "english": "bottom"
  },
  {
    "spanish": "clave",
    "english": "key"
  },
  {
    "spanish": "hierro",
    "english": "iron"
  },
  {
    "spanish": "sola",
    "english": "single"
  },
  {
    "spanish": "palillo",
    "english": "stick"
  },
  {
    "spanish": "plana",
    "english": "flat"
  },
  {
    "spanish": "veinte",
    "english": "twenty"
  },
  {
    "spanish": "piel",
    "english": "skin"
  },
  {
    "spanish": "sonrisa",
    "english": "smile"
  },
  {
    "spanish": "pliegue",
    "english": "crease"
  },
  {
    "spanish": "agujero",
    "english": "hole"
  },
  {
    "spanish": "saltar",
    "english": "jump"
  },
  {
    "spanish": "bebé",
    "english": "baby"
  },
  {
    "spanish": "ocho",
    "english": "eight"
  },
  {
    "spanish": "pueblo",
    "english": "village"
  },
  {
    "spanish": "se reúnen",
    "english": "meet"
  },
  {
    "spanish": "raíz",
    "english": "root"
  },
  {
    "spanish": "comprar",
    "english": "buy"
  },
  {
    "spanish": "aumentar",
    "english": "raise"
  },
  {
    "spanish": "resolver",
    "english": "solve"
  },
  {
    "spanish": "de metal",
    "english": "metal"
  },
  {
    "spanish": "si",
    "english": "whether"
  },
  {
    "spanish": "empujar",
    "english": "push"
  },
  {
    "spanish": "siete",
    "english": "seven"
  },
  {
    "spanish": "párrafo",
    "english": "paragraph"
  },
  {
    "spanish": "tercero",
    "english": "third"
  },
  {
    "spanish": "deberá",
    "english": "shall"
  },
  {
    "spanish": "en espera",
    "english": "held"
  },
  {
    "spanish": "pelo",
    "english": "hair"
  },
  {
    "spanish": "describir",
    "english": "describe"
  },
  {
    "spanish": "cocinero",
    "english": "cook"
  },
  {
    "spanish": "piso",
    "english": "floor"
  },
  {
    "spanish": "ya sea",
    "english": "either"
  },
  {
    "spanish": "resultado",
    "english": "result"
  },
  {
    "spanish": "quemar",
    "english": "burn"
  },
  {
    "spanish": "colina",
    "english": "hill"
  },
  {
    "spanish": "seguro",
    "english": "safe"
  },
  {
    "spanish": "gato",
    "english": "cat"
  },
  {
    "spanish": "siglo",
    "english": "century"
  },
  {
    "spanish": "considerar",
    "english": "consider"
  },
  {
    "spanish": "tipo",
    "english": "type"
  },
  {
    "spanish": "ley",
    "english": "law"
  },
  {
    "spanish": "bit",
    "english": "bit"
  },
  {
    "spanish": "costa",
    "english": "coast"
  },
  {
    "spanish": "copia",
    "english": "copy"
  },
  {
    "spanish": "frase",
    "english": "phrase"
  },
  {
    "spanish": "silencio",
    "english": "silent"
  },
  {
    "spanish": "de altura",
    "english": "tall"
  },
  {
    "spanish": "arena",
    "english": "sand"
  },
  {
    "spanish": "suelo",
    "english": "soil"
  },
  {
    "spanish": "rollo",
    "english": "roll"
  },
  {
    "spanish": "temperatura",
    "english": "temperature"
  },
  {
    "spanish": "dedo",
    "english": "finger"
  },
  {
    "spanish": "industria",
    "english": "industry"
  },
  {
    "spanish": "valor",
    "english": "value"
  },
  {
    "spanish": "lucha",
    "english": "fight"
  },
  {
    "spanish": "mentira",
    "english": "lie"
  },
  {
    "spanish": "batir",
    "english": "beat"
  },
  {
    "spanish": "excitar",
    "english": "excite"
  },
  {
    "spanish": "naturales",
    "english": "natural"
  },
  {
    "spanish": "vista",
    "english": "view"
  },
  {
    "spanish": "sentido",
    "english": "sense"
  },
  {
    "spanish": "de capital",
    "english": "capital"
  },
  {
    "spanish": "no lo hará",
    "english": "won’t"
  },
  {
    "spanish": "silla",
    "english": "chair"
  },
  {
    "spanish": "peligro",
    "english": "danger"
  },
  {
    "spanish": "fruta",
    "english": "fruit"
  },
  {
    "spanish": "rica",
    "english": "rich"
  },
  {
    "spanish": "de espesor",
    "english": "thick"
  },
  {
    "spanish": "soldado",
    "english": "soldier"
  },
  {
    "spanish": "proceso",
    "english": "process"
  },
  {
    "spanish": "operar",
    "english": "operate"
  },
  {
    "spanish": "práctica",
    "english": "practice"
  },
  {
    "spanish": "separada",
    "english": "separate"
  },
  {
    "spanish": "difícil",
    "english": "difficult"
  },
  {
    "spanish": "médico",
    "english": "doctor"
  },
  {
    "spanish": "por favor",
    "english": "please"
  },
  {
    "spanish": "proteger",
    "english": "protect"
  },
  {
    "spanish": "mediodía",
    "english": "noon"
  },
  {
    "spanish": "de cultivos",
    "english": "crop"
  },
  {
    "spanish": "moderno",
    "english": "modern"
  },
  {
    "spanish": "elemento",
    "english": "element"
  },
  {
    "spanish": "golpear",
    "english": "hit"
  },
  {
    "spanish": "estudiante",
    "english": "student"
  },
  {
    "spanish": "esquina",
    "english": "corner"
  },
  {
    "spanish": "partido",
    "english": "party"
  },
  {
    "spanish": "suministro",
    "english": "supply"
  },
  {
    "spanish": "cuya",
    "english": "whose"
  },
  {
    "spanish": "localizar",
    "english": "locate"
  },
  {
    "spanish": "anillo",
    "english": "ring"
  },
  {
    "spanish": "carácter",
    "english": "character"
  },
  {
    "spanish": "insecto",
    "english": "insect"
  },
  {
    "spanish": "capturado",
    "english": "caught"
  },
  {
    "spanish": "período",
    "english": "period"
  },
  {
    "spanish": "indicar",
    "english": "indicate"
  },
  {
    "spanish": "Radio",
    "english": "radio"
  },
  {
    "spanish": "habló",
    "english": "spoke"
  },
  {
    "spanish": "átomo",
    "english": "atom"
  },
  {
    "spanish": "humana",
    "english": "human"
  },
  {
    "spanish": "historia",
    "english": "history"
  },
  {
    "spanish": "efecto",
    "english": "effect"
  },
  {
    "spanish": "eléctrica",
    "english": "electric"
  },
  {
    "spanish": "esperar",
    "english": "expect"
  },
  {
    "spanish": "hueso",
    "english": "bone"
  },
  {
    "spanish": "ferrocarril",
    "english": "rail"
  },
  {
    "spanish": "imaginar",
    "english": "imagine"
  },
  {
    "spanish": "proporcionar",
    "english": "provide"
  },
  {
    "spanish": "acuerdo",
    "english": "agree"
  },
  {
    "spanish": "por tanto,",
    "english": "thus"
  },
  {
    "spanish": "suave",
    "english": "gentle"
  },
  {
    "spanish": "mujer",
    "english": "woman"
  },
  {
    "spanish": "capitán",
    "english": "captain"
  },
  {
    "spanish": "adivinar",
    "english": "guess"
  },
  {
    "spanish": "necesario",
    "english": "necessary"
  },
  {
    "spanish": "agudo",
    "english": "sharp"
  },
  {
    "spanish": "ala",
    "english": "wing"
  },
  {
    "spanish": "crear",
    "english": "create"
  },
  {
    "spanish": "vecino",
    "english": "neighbor"
  },
  {
    "spanish": "lavado",
    "english": "wash"
  },
  {
    "spanish": "bate",
    "english": "bat"
  },
  {
    "spanish": "más bien",
    "english": "rather"
  },
  {
    "spanish": "multitud",
    "english": "crowd"
  },
  {
    "spanish": "maíz",
    "english": "corn"
  },
  {
    "spanish": "comparar",
    "english": "compare"
  },
  {
    "spanish": "poema",
    "english": "poem"
  },
  {
    "spanish": "cadena",
    "english": "string"
  },
  {
    "spanish": "campana",
    "english": "bell"
  },
  {
    "spanish": "dependerá",
    "english": "depend"
  },
  {
    "spanish": "carne",
    "english": "meat"
  },
  {
    "spanish": "frotar",
    "english": "rub"
  },
  {
    "spanish": "tubo",
    "english": "tube"
  },
  {
    "spanish": "famoso",
    "english": "famous"
  },
  {
    "spanish": "dólar",
    "english": "dollar"
  },
  {
    "spanish": "corriente",
    "english": "stream"
  },
  {
    "spanish": "miedo",
    "english": "fear"
  },
  {
    "spanish": "vista",
    "english": "sight"
  },
  {
    "spanish": "delgado",
    "english": "thin"
  },
  {
    "spanish": "triángulo",
    "english": "triangle"
  },
  {
    "spanish": "planeta",
    "english": "planet"
  },
  {
    "spanish": "prisa",
    "english": "hurry"
  },
  {
    "spanish": "jefe",
    "english": "chief"
  },
  {
    "spanish": "colonia",
    "english": "colony"
  },
  {
    "spanish": "reloj",
    "english": "clock"
  },
  {
    "spanish": "mina",
    "english": "mine"
  },
  {
    "spanish": "empate",
    "english": "tie"
  },
  {
    "spanish": "entrar",
    "english": "enter"
  },
  {
    "spanish": "importante",
    "english": "major"
  },
  {
    "spanish": "fresco",
    "english": "fresh"
  },
  {
    "spanish": "búsqueda",
    "english": "search"
  },
  {
    "spanish": "enviar",
    "english": "send"
  },
  {
    "spanish": "amarillo",
    "english": "yellow"
  },
  {
    "spanish": "pistola",
    "english": "gun"
  },
  {
    "spanish": "permitir",
    "english": "allow"
  },
  {
    "spanish": "print",
    "english": "print"
  },
  {
    "spanish": "muerto",
    "english": "dead"
  },
  {
    "spanish": "lugar",
    "english": "spot"
  },
  {
    "spanish": "desierto",
    "english": "desert"
  },
  {
    "spanish": "traje",
    "english": "suit"
  },
  {
    "spanish": "actual",
    "english": "current"
  },
  {
    "spanish": "ascensor",
    "english": "lift"
  },
  {
    "spanish": "rosa",
    "english": "rose"
  },
  {
    "spanish": "llegar",
    "english": "arrive"
  },
  {
    "spanish": "master",
    "english": "master"
  },
  {
    "spanish": "pista",
    "english": "track"
  },
  {
    "spanish": "padre",
    "english": "parent"
  },
  {
    "spanish": "orilla",
    "english": "shore"
  },
  {
    "spanish": "división",
    "english": "division"
  },
  {
    "spanish": "hoja",
    "english": "sheet"
  },
  {
    "spanish": "sustancia",
    "english": "substance"
  },
  {
    "spanish": "favorecer",
    "english": "favor"
  },
  {
    "spanish": "conectar",
    "english": "connect"
  },
  {
    "spanish": "mensaje",
    "english": "post"
  },
  {
    "spanish": "pasar",
    "english": "spend"
  },
  {
    "spanish": "acorde",
    "english": "chord"
  },
  {
    "spanish": "grasa",
    "english": "fat"
  },
  {
    "spanish": "contento",
    "english": "glad"
  },
  {
    "spanish": "originales",
    "english": "original"
  },
  {
    "spanish": "cuota",
    "english": "share"
  },
  {
    "spanish": "estación",
    "english": "station"
  },
  {
    "spanish": "papá",
    "english": "dad"
  },
  {
    "spanish": "pan",
    "english": "bread"
  },
  {
    "spanish": "cobrar",
    "english": "charge"
  },
  {
    "spanish": "adecuada",
    "english": "proper"
  },
  {
    "spanish": "barra",
    "english": "bar"
  },
  {
    "spanish": "oferta",
    "english": "offer"
  },
  {
    "spanish": "segmento",
    "english": "segment"
  },
  {
    "spanish": "esclavo",
    "english": "slave"
  },
  {
    "spanish": "pato",
    "english": "duck"
  },
  {
    "spanish": "instantánea",
    "english": "instant"
  },
  {
    "spanish": "mercado",
    "english": "market"
  },
  {
    "spanish": "grado",
    "english": "degree"
  },
  {
    "spanish": "poblar",
    "english": "populate"
  },
  {
    "spanish": "polluelo",
    "english": "chick"
  },
  {
    "spanish": "querido",
    "english": "dear"
  },
  {
    "spanish": "enemigo",
    "english": "enemy"
  },
  {
    "spanish": "responder",
    "english": "reply"
  },
  {
    "spanish": "bebida",
    "english": "drink"
  },
  {
    "spanish": "producirse",
    "english": "occur"
  },
  {
    "spanish": "apoyo",
    "english": "support"
  },
  {
    "spanish": "discurso",
    "english": "speech"
  },
  {
    "spanish": "naturaleza",
    "english": "nature"
  },
  {
    "spanish": "alcance",
    "english": "range"
  },
  {
    "spanish": "vapor",
    "english": "steam"
  },
  {
    "spanish": "movimiento",
    "english": "motion"
  },
  {
    "spanish": "camino",
    "english": "path"
  },
  {
    "spanish": "líquido",
    "english": "liquid"
  },
  {
    "spanish": "log",
    "english": "log"
  },
  {
    "spanish": "significado",
    "english": "meant"
  },
  {
    "spanish": "cociente",
    "english": "quotient"
  },
  {
    "spanish": "dientes",
    "english": "teeth"
  },
  {
    "spanish": "concha",
    "english": "shell"
  },
  {
    "spanish": "cuello",
    "english": "neck"
  },
  {
    "spanish": "oxígeno",
    "english": "oxygen"
  },
  {
    "spanish": "azúcar",
    "english": "sugar"
  },
  {
    "spanish": "muerte",
    "english": "death"
  },
  {
    "spanish": "bastante",
    "english": "pretty"
  },
  {
    "spanish": "habilidad",
    "english": "skill"
  },
  {
    "spanish": "mujeres",
    "english": "women"
  },
  {
    "spanish": "temporada",
    "english": "season"
  },
  {
    "spanish": "solución",
    "english": "solution"
  },
  {
    "spanish": "imán",
    "english": "magnet"
  },
  {
    "spanish": "plata",
    "english": "silver"
  },
  {
    "spanish": "gracias",
    "english": "thank"
  },
  {
    "spanish": "rama",
    "english": "branch"
  },
  {
    "spanish": "partido",
    "english": "match"
  },
  {
    "spanish": "sufijo",
    "english": "suffix"
  },
  {
    "spanish": "especialmente",
    "english": "especially"
  },
  {
    "spanish": "higo",
    "english": "fig"
  },
  {
    "spanish": "miedo",
    "english": "afraid"
  },
  {
    "spanish": "enorme",
    "english": "huge"
  },
  {
    "spanish": "hermana",
    "english": "sister"
  },
  {
    "spanish": "acero",
    "english": "steel"
  },
  {
    "spanish": "discutir",
    "english": "discuss"
  },
  {
    "spanish": "adelante",
    "english": "forward"
  },
  {
    "spanish": "similar",
    "english": "similar"
  },
  {
    "spanish": "guiar",
    "english": "guide"
  },
  {
    "spanish": "experiencia",
    "english": "experience"
  },
  {
    "spanish": "puntuación",
    "english": "score"
  },
  {
    "spanish": "manzana",
    "english": "apple"
  },
  {
    "spanish": "comprado",
    "english": "bought"
  },
  {
    "spanish": "llevado",
    "english": "led"
  },
  {
    "spanish": "pitch",
    "english": "pitch"
  },
  {
    "spanish": "abrigo",
    "english": "coat"
  },
  {
    "spanish": "masa",
    "english": "mass"
  },
  {
    "spanish": "tarjeta",
    "english": "card"
  },
  {
    "spanish": "banda",
    "english": "band"
  },
  {
    "spanish": "cuerda",
    "english": "rope"
  },
  {
    "spanish": "deslizamiento",
    "english": "slip"
  },
  {
    "spanish": "ganar",
    "english": "win"
  },
  {
    "spanish": "soñar",
    "english": "dream"
  },
  {
    "spanish": "noche",
    "english": "evening"
  },
  {
    "spanish": "condición",
    "english": "condition"
  },
  {
    "spanish": "pienso",
    "english": "feed"
  },
  {
    "spanish": "herramienta",
    "english": "tool"
  },
  {
    "spanish": "totales",
    "english": "total"
  },
  {
    "spanish": "básico",
    "english": "basic"
  },
  {
    "spanish": "olor",
    "english": "smell"
  },
  {
    "spanish": "valle",
    "english": "valley"
  },
  {
    "spanish": "ni",
    "english": "nor"
  },
  {
    "spanish": "doble",
    "english": "double"
  },
  {
    "spanish": "asiento",
    "english": "seat"
  },
  {
    "spanish": "continuar",
    "english": "continue"
  },
  {
    "spanish": "bloque",
    "english": "block"
  },
  {
    "spanish": "tabla",
    "english": "chart"
  },
  {
    "spanish": "sombrero",
    "english": "hat"
  },
  {
    "spanish": "vender",
    "english": "sell"
  },
  {
    "spanish": "éxito",
    "english": "success"
  },
  {
    "spanish": "empresa",
    "english": "company"
  },
  {
    "spanish": "restar",
    "english": "subtract"
  },
  {
    "spanish": "evento",
    "english": "event"
  },
  {
    "spanish": "particular,",
    "english": "particular"
  },
  {
    "spanish": "acuerdo",
    "english": "deal"
  },
  {
    "spanish": "nadar",
    "english": "swim"
  },
  {
    "spanish": "plazo",
    "english": "term"
  },
  {
    "spanish": "opuesta",
    "english": "opposite"
  },
  {
    "spanish": "esposa",
    "english": "wife"
  },
  {
    "spanish": "zapato",
    "english": "shoe"
  },
  {
    "spanish": "hombro",
    "english": "shoulder"
  },
  {
    "spanish": "propagación",
    "english": "spread"
  },
  {
    "spanish": "organizar",
    "english": "arrange"
  },
  {
    "spanish": "campamento",
    "english": "camp"
  },
  {
    "spanish": "inventar",
    "english": "invent"
  },
  {
    "spanish": "algodón",
    "english": "cotton"
  },
  {
    "spanish": "nacido",
    "english": "born"
  },
  {
    "spanish": "determinar",
    "english": "determine"
  },
  {
    "spanish": "cuarto de galón",
    "english": "quart"
  },
  {
    "spanish": "nueve",
    "english": "nine"
  },
  {
    "spanish": "camión",
    "english": "truck"
  },
  {
    "spanish": "ruido",
    "english": "noise"
  },
  {
    "spanish": "nivel",
    "english": "level"
  },
  {
    "spanish": "oportunidad",
    "english": "chance"
  },
  {
    "spanish": "reunir",
    "english": "gather"
  },
  {
    "spanish": "tienda",
    "english": "shop"
  },
  {
    "spanish": "tramo",
    "english": "stretch"
  },
  {
    "spanish": "lanzar",
    "english": "throw"
  },
  {
    "spanish": "brillo",
    "english": "shine"
  },
  {
    "spanish": "propiedad",
    "english": "property"
  },
  {
    "spanish": "columna",
    "english": "column"
  },
  {
    "spanish": "molécula",
    "english": "molecule"
  },
  {
    "spanish": "seleccionar",
    "english": "select"
  },
  {
    "spanish": "mal",
    "english": "wrong"
  },
  {
    "spanish": "gris",
    "english": "gray"
  },
  {
    "spanish": "repita",
    "english": "repeat"
  },
  {
    "spanish": "exigir",
    "english": "require"
  },
  {
    "spanish": "amplio",
    "english": "broad"
  },
  {
    "spanish": "preparar",
    "english": "prepare"
  },
  {
    "spanish": "sal",
    "english": "salt"
  },
  {
    "spanish": "nariz",
    "english": "nose"
  },
  {
    "spanish": "plurales",
    "english": "plural"
  },
  {
    "spanish": "cólera",
    "english": "anger"
  },
  {
    "spanish": "reclamación",
    "english": "claim"
  },
  {
    "spanish": "continente",
    "english": "continent"
  }
];

      let seenWords = new Set();
      
      function getNewWord() {
        let availableWords = vocabulary.filter(word => !seenWords.has(word.spanish));
        
        if (availableWords.length === 0) {
          seenWords.clear();
          availableWords = vocabulary;
        }
        
        const word = availableWords[Math.floor(Math.random() * availableWords.length)];
        seenWords.add(word.spanish);
        
        document.getElementById('vocab-spanish').textContent = word.spanish;
        document.getElementById('vocab-english').textContent = word.english;
        document.getElementById('vocab-english').style.display = 'none';
        document.getElementById('vocab-toggle').textContent = 'Show Translation';
        
        document.getElementById('vocab-progress').textContent = 
          `Progress: ${seenWords.size} of ${vocabulary.length}`;  // Modified text format
      }

      document.getElementById('vocab-toggle').onclick = function() {
        const englishWord = document.getElementById('vocab-english');
        const isHidden = englishWord.style.display === 'none';
        englishWord.style.display = isHidden ? 'block' : 'none';
        this.textContent = isHidden ? 'Hide Translation' : 'Show Translation';
      };

      document.getElementById('vocab-next').onclick = getNewWord;

      // Initialize with first word
      getNewWord();
    })();
  </script>
</div>