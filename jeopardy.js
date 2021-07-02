
const BASE_API_URL = "http://jservice.io/api/";
const NUM_CATEGORIES = 6;
const NUM_CLUES_PER_CAT = 5;
const $board = $('#main-table');
const $spinner = $('#spinner');
const $startGame = $('#start-game');

// categories is the main data structure for the app; it should eventually look like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: "4", showing: null},
//        {question: "1+1", answer: "2", showing: null}, ... 3 more clues ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null}, ...
//      ],
//    }, ...4 more categories ...
//  ]
//use to get random elements from an array//
//  _.sampleSize(arry,2);********************


let categories = [];


/** Get NUM_CATEGORIES random categories from API.
 *
 * Returns array of category ids, e.g. [4, 12, 5, 9, 20, 1]
 */

async function getCategoryIds() {
    // const response = await axios.get('http://jservice.io/api/categories?count=100');
    const response = await axios.get('http://jservice.io/api/categories', { params: { count: 100 } });
    let categoriesData = _.sampleSize(response.data, NUM_CATEGORIES);
    return categoriesData.map(cat => cat.id);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ... 3 more ...
 *   ]
 */

async function getCategory(catId) {
    // const response = await axios.get(`http://jservice.io/api/category?id=${catId}`);
    const response = await axios({
        url: `${BASE_API_URL}/category?id=${catId}`,
        method: "GET"
    });
    // console.log(response.data.title)
    let title = response.data.title;
    let randomClues = _.sampleSize(response.data.clues, NUM_CLUES_PER_CAT);
    let clues = randomClues.map(clue => {
        let question = clue.question;
        let answer = clue.answer;
        let showing = null;
        return { question, answer, showing };
    });
    return { title, clues };
}

/** Fill an HTML table with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM-QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initially, just show a "?" where the question/answer would go.)
 */

function fillTable() {
    const $tableBody = $('#table-body');
    const $tableHead = $('#table-head');
    $tableHead.empty();
    const $tableHeadRow = $('<tr></tr>');

    for (let cat of categories) {
        const title = cat.title;
        $tableHeadRow.append($(`<th>${title}</th>`));
    }
    $tableHead.append($tableHeadRow);
    $tableBody.empty();

    for (let i = 0; i < NUM_CLUES_PER_CAT; i++) {
        const $tableBodyRow = $('<tr></tr>');
        for (let j = 0; j < NUM_CATEGORIES; j++) {
            // for (let cat of categories) {
            // console.log("cat clues ====> ", cat.clues)
            // console.log("cat clues at idx", i, "====>", cat.clues[i])
            // console.log("question cat clues at idx====>",i, cat.clues[i].question)
            // const question = cat.clues[i].question;
            // console.log(question);
            // $tableBodyRow.append($(`<td id="${j}-${i}">?</td>`));
            $tableBodyRow.append($(`<td id="${j}-${i}"><i class="fas fa-question-circle"></i></i></i></td>`));
        }
        $tableBody.append($tableBodyRow);
    }
}
// spinners from font awesome 
// <i class="far fa-question-circle"></i>
//<i class="fas fa-question-circle"></i>

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    let target = $(evt.target);
    let clueId = target.attr('id');
    let id = clueId.split('-'); // will be an array of [j(category), i(clue)].
    let categoryIndex = id[0];
    let clueIndex = id[1];
    let clue = categories[categoryIndex].clues[clueIndex];
    // debugger
    if (clue.showing === null) {
        clue.showing = "question";
        target.empty();
        target.text(clue.question);
        // console.log('showing was null and now showing is ====>', clue.showing);
    } else if (clue.showing === "question") {
        clue.showing = "answer";
        target.empty();
        target.text(clue.answer);
        target.css("background-color","#28a200");
        // console.log('showing was question and now showing is ====>', clue.showing);
    } else {
        return;
    }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    $board.hide();
    $spinner.show();
    $startGame.hide();
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    $spinner.hide();
    $startGame.show();
    $startGame.text('Restart!');
    $board.show();
}

/** Setup game data and board:
 * - get random category Ids
 * - get data for each category
 * - call fillTable to create HTML table
 */

async function setupGameBoard() {
    categories = []; // reset / empty categories array.
    // console.log('Start button is clicked!')
    let catIds = await getCategoryIds();
    // console.log(catIds);
    for (let id of catIds) {
        categories.push(await getCategory(id));
    }
    // console.log(categories);
    fillTable();
}

/** Start game: show loading state, setup game board, stop loading state */

async function setupAndStart() {
    showLoadingView();
    await setupGameBoard();
    hideLoadingView();
}


/** Click handler to your start button that will run setupAndStart */
$startGame.on('click', setupAndStart);

/** Click handler to your board that will run handleClick */
$board.on('click', 'td', handleClick);
