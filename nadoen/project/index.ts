import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";

import { Character, PlayerInfo, Movie, Quote, FavoritedQuote, BlackListedQuote } from "./types";
import { addExp, ExpPercentage } from "./experience";
import { createPlayer, connect, addUser, checkExistingPlayer, checkLogin, updateProfile, findByX, addQuoteToBlacklist, addQuoteToFavorites } from "./database";
import bcrypt from 'bcrypt';
import session from "./session";
import { secureMiddleware, loggedIn } from "./secureMiddleware";

dotenv.config();

const app: Express = express();
const favicon = require("serve-favicon")

app.set("view engine", "ejs");
app.use(express.json());
app.use(session)
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.set("port", process.env.PORT ?? 3000);

let CHARACTERS: Character[] = [];
// let CHARACTERS_WITHOUT_QUOTE: Character[] = [];
let QUOTES: Quote[] = [];
// let quizTeam: Character[] = [];
let selectedCharacter: Character;
let selectedQuote: Quote;
let movies: Movie[] = [];

function generateRandomNumber(max: number): number {
    return Math.floor(Math.random() * max);
}

async function generatedSelectedCharacter(number: number) {
    const randomNum = generateRandomNumber(number);
    selectedCharacter = CHARACTERS[randomNum];

    const selectedQuoteIndex = generateRandomNumber(selectedCharacter.quotes.length);
    selectedQuote = selectedCharacter.quotes[selectedQuoteIndex];
    // console.log("Debug;" + selectedQuoteIndex, selectedCharacter.quotes.length - 1)
}

async function generateTeam(): Promise<Character[]> {
    const usedNumbers: number[] = [];
    const team: Character[] = [];
    let randomNum = -1;

    while (team.length < 3) {
        randomNum = generateRandomNumber(CHARACTERS.length);

        //Dit is een check om te kijken of de nieuw gemaakte nummer al eens is gebruikt geweest met het maken van dit team.
        if (!usedNumbers.includes(randomNum)) {
            const character = CHARACTERS[randomNum];
            usedNumbers.push(randomNum);
            team.push(character);
        }
    }
    // console.log(team.map((e) => e.name))
    return team;
}

async function getMovies() {
    const response = await fetch("http://localhost:3000/data/movies.json");
    if (!response.ok) {
        throw new Error("Failed to fetch movies");
    }
    movies = await response.json();
}

const ERROR_MESSAGE_UPDATE_ACCOUNT = ["Het herhaalde wachtwoord is niet hetzelfde!", "Deze gebruiksnaam is al in gebruik!", "Deze email is al in gebruik!"]

async function getCharactersWithQuotes() {
    try {
        //Dit is momenteel gewoon mijn bearer-token we kunnen zien of we dit houden of later nog dynamisch willen aanpassen per log-in account
        const headers = {
            authorization: "Bearer FrpwbfRPTwxJOACKq3D_"
        };

        //Alle quotes ophalen
        const quotesResponse = await fetch("https://the-one-api.dev/v2/quote", { headers });
        if (!quotesResponse.ok) {
            throw new Error(`Er is iets misgelopen met het ophalen van de quotes: ${quotesResponse.status}`);
        }
        const quotesData = await quotesResponse.json();
        QUOTES = quotesData.docs;

        //Alle  unieke character id's van de quotes bijhouden in een set
        const characterIdsWithQuotes = new Set(
            QUOTES.map((quote: Quote) => quote.character)
        );

        //Alle characters ophalen
        const charactersResponse = await fetch("https://the-one-api.dev/v2/character", { headers });
        if (!charactersResponse.ok) {
            throw new Error(`Er is iets misgelopen met het ophalen van de characters: ${charactersResponse.status}`);
        }
        const charactersData = await charactersResponse.json();

        //Dit is om een lijst te maken met alle id's die toegelaten zijn van de api
        const localIdsResponse = await fetch("http://localhost:3000/data/lotr_characters_with_quotes.json");
        if (!localIdsResponse.ok) {
            throw new Error("Failed to fetch local character IDs");
        };
        const localIdsData = await localIdsResponse.json();
        const allowedIds = new Set(localIdsData.map((char: { id: string }) => char.id));

        //Alle characters filteren die minstens 1 movie-quote hebben
        CHARACTERS = charactersData.docs.filter((character: Character) =>
            characterIdsWithQuotes.has(character._id) && allowedIds.has(character._id)
        );

        //Alle quotes die een character heeft bijhouden in hun property quotes.
        for (const character of CHARACTERS) {
            character.quotes = QUOTES.filter((quote: Quote) => quote.character === character._id && quote.dialog.length <= 50);
        }

        //Alle characters filteren zodat enkel de characters overblijven die in de json file zitten

        // for (const character of CHARACTERS) {
        //     console.log(character.name)
        // }

    } catch (error) {
        console.error(`Error: ${error}`);
    }
}

app.get("/register", loggedIn, (req, res) => {
    res.render("register", {
        error: null
    });
});

app.get("/login", loggedIn, (req, res) => {
    res.render("login", {
        error: null
    })
})

app.post("/login", async (req, res) => {
    let username: string = req.body.username;
    let password: string = req.body.password;
    let userExists: PlayerInfo | undefined = await checkLogin(username, password)
    if (!userExists) {
        return res.render("login", {
            error: "Gebruikersnaam of wachtwoord is onjuist."
        })
    }
    req.session.user = userExists
    res.redirect("welcomepage")
})

app.post("/register", async (req, res) => {
    let email: string = req.body.email;
    let username: string = req.body.username;
    let password: string = req.body.password;
    let image_url: string = req.body.profile_picture;
    const hashedPassword: string = await bcrypt.hash(password, 10)
    if (!(await checkExistingPlayer(email, username))) {
        await addUser(createPlayer(username, hashedPassword, email, image_url))
        res.redirect("quiz")
    } else {
        return res.render("register", {
            error: "Username or email already exists!"
        })
    }
});

app.post("/update-account", async (req, res) => {
    if (req.session.user) {
        const user: PlayerInfo = req.session.user
        //Check of de wachtwoorden wel hetzelfde zijn
        if (req.body.password !== req.body.repeated_password) {
            return res.render("account-settings", {
                player: req.session.user,
                error: ERROR_MESSAGE_UPDATE_ACCOUNT[0]
            })
        }
        //Check of de username als is gepakt door iemand
        if (await findByX(user, req.body.username, "username")) {
            return res.render("account-settings", {
                player: req.session.user,
                error: ERROR_MESSAGE_UPDATE_ACCOUNT[1]
            })
        }
        //Check of het email al is gepakt door iemand
        if (req.body.username !== user.username && await findByX(user, req.body.username, "username")) {
            return res.render("account-settings", {
                player: req.session.user,
                error: ERROR_MESSAGE_UPDATE_ACCOUNT[2]
            })
        }
        req.session.user.imageUrl = req.body.profile_picture;
        req.session.user.name = req.body.name;
        req.session.user.email = req.body.email;
        req.session.user.username = req.body.username;
        req.session.user.password = await bcrypt.hash(req.body.password, 10);
        await updateProfile(req.session.user)
        res.render("account-settings", {
            player: req.session.user,
            error: null
        })
    }
})

app.post("/next", (req, res) => {
    const character_id = req.body.character_id
    const movie_id = req.body.movie_id
    const choice_quote = req.body.quote_choice
    const blacklist_reason = req.body.blacklist_reason

    if (choice_quote === "favorited") {
        addQuoteToFavorites(selectedQuote, req.session.user!)
    } else if (choice_quote === "blacklist") {
        addQuoteToBlacklist(selectedQuote, req.session.user!, blacklist_reason)
    } else {
    }

    if (req.session.userCurrentQuestion === undefined) {
        req.session.userCurrentQuestion = 1;
    }
    if (req.session.userCurrentScore === undefined) {
        req.session.userCurrentScore = 0
    }

    if (selectedQuote.movie === movie_id && selectedQuote.character === character_id) {
        req.session.userCurrentScore += 1;
        req.session.userCurrentQuestion += 1;
    } else {
        req.session.userCurrentQuestion += 1;
    }

    res.redirect("/10-rounds")

})

app.post("/logout", async (req, res) => {
    await updateProfile(req.session.user)
    req.session.destroy(() => {
        res.redirect("/login")
    })
})

app.get("/", (req, res) => {
    res.render("landingpage")
});

app.get("/10-rounds", secureMiddleware, async (req, res) => {
    console.log(req.session.favoritedQuotes);
    if (!req.session.gameStarted) {
        req.session.userCurrentQuestion = 1;
        req.session.userCurrentScore = 0;
    }
    req.session.gameStarted = true;
    const quizTeam: Character[] = await generateTeam();
    await generatedSelectedCharacter(quizTeam.length);
    res.render("10-rounds", {
        player: req.session.user,
        characters: quizTeam,
        movies: movies,
        selectedCharacter: selectedCharacter,
        selectedQuote: selectedQuote,
        userCurrentQuestion: req.session.userCurrentQuestion || 1,
        userCurrentScore: req.session.userCurrentScore || 0,
        favoritedQuotes: req.session.favoritedQuotes
    })
})

app.get("/blacklist", secureMiddleware, async (req, res) => {
    const blackListedArray: BlackListedQuote[] = []
    // req.session.blackListedQuotes.forEach((e) => console.log(e.dialog)) //debug
    // console.log(req.session.user?.blacklistedQuotes)
    req.session.user?.blacklistedQuotes.forEach((quotes) => {
        const foundCharacter = CHARACTERS.find((characters) => {
            return characters._id === quotes.character
        })
        let charInArray = blackListedArray.find((q) => {
            return q.character._id === foundCharacter!._id
        })
        if (!charInArray) {
            charInArray = {
                character: foundCharacter!,
                dialog: []
            }
            blackListedArray.push(charInArray)
        }
        charInArray.dialog.push({
            quoteText: quotes.dialog,
            blackListReason: quotes.reason!
        })
    })
    req.session.blackListedQuotes = blackListedArray;
    res.render("blacklist", {
        title: "Blacklist",
        bQ: req.session.blackListedQuotes
    })
})

app.get("/favorites", secureMiddleware, async (req, res) => {
    const quotesByCharacter: FavoritedQuote[] = []
    req.session.user?.favoritedQuotes.forEach((quotes) => {
        const foundCharacter = CHARACTERS.find((characters) => {
            return characters._id === quotes.character
        })
        let charInArray = quotesByCharacter.find((q) => {
            return q.character._id === foundCharacter!._id
        })
        if (!charInArray) {
            charInArray = {
                character: foundCharacter!,
                dialog: []
            }
            quotesByCharacter.push(charInArray)
        }
        charInArray.dialog.push(quotes.dialog)
    })
    req.session.favoritedQuotes = quotesByCharacter;
    res.render("favorites", {
        title: "Favorites",
        quotes: req.session.user?.favoritedQuotes,
        sortedQuotes: quotesByCharacter
    })
})

app.post("/edit-quote/:id/update", secureMiddleware, (req, res) => {
    const index: string = req.params.id;
    let findQuote: Quote | undefined = req.session.user?.blacklistedQuotes?.find((e) => {
        return e.dialog === index;
    })
    console.log(req.body)
    if (findQuote) {
        console.log("foundq uote")
        findQuote.reason = req.body.blackListReason
    }
    res.redirect("/blacklist")
})

app.get("/edit-quote/:id", secureMiddleware, (req, res) => {
    let index: string = req.params.id
    let findQuote: BlackListedQuote | undefined = req.session.blackListedQuotes?.find((e) => {
        return e.dialog.find((q) => q.quoteText === index)
    })
    if (findQuote) {
        res.render("blacklisted-quote", {
            quote: findQuote
        }
        )
    } else {
        res.redirect("/blacklist")
    }
})

app.post("/blacklist/:id", secureMiddleware, (req, res) => {
    let index: string = req.params.id
    let findCharacter: BlackListedQuote | undefined = req.session.blackListedQuotes?.find((e) => {
        return e.dialog.find((q) => q.quoteText === index)
    })
    findCharacter?.dialog.forEach((e) => console.log(e.quoteText))
    if (findCharacter) {
        findCharacter.dialog = findCharacter.dialog.filter((e) => e.quoteText !== index);
        req.session.user!.blacklistedQuotes = req.session.user!.blacklistedQuotes.filter((e) => e.dialog !== index)
    }
    res.redirect("/blacklist")
})

app.post("/favorites/:id", secureMiddleware, (req, res) => {
    let index: string = req.params.id
    console.log(index)
    let findCharacter: FavoritedQuote | undefined = req.session.favoritedQuotes?.find((e) => {
        return e.dialog.includes(index)
    })
    if (findCharacter) {
        findCharacter.dialog = findCharacter.dialog.filter((e) => e !== index);
        req.session.favoritedQuotes?.forEach((e) => {
            if (e === findCharacter) {
                e = findCharacter
            }
        })
        req.session.user!.favoritedQuotes = req.session.user!.favoritedQuotes.filter((e) => e.dialog !== index)
    }
    res.redirect("/favorites")
})

app.get("/:index", secureMiddleware, async (req, res) => {
    // req.session.blackListedQuotes = []
    // req.session.user!.blacklistedQuotes = [] //kleine reset
    // console.log(req.session.blackListArray, req.session.blackListedQuotes)
    req.session.gameStarted = false;
    let index: string = req.params.index
    const expPercentage: number = 0
    if (index !== "ico") {
        res.render(index, {
            title: index.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            player: req.session.user,
            exp_progress: expPercentage,
            error: null,
        })
    }
});

app.listen(app.get("port"), async () => {
    console.log("Server started on http://localhost:" + app.get("port"));
    try {
        await getCharactersWithQuotes();
        await getMovies();
    } catch (e) {
        console.log(e)
    }
    await connect();
});

