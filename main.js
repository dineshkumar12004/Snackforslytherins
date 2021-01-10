var userName;
var size = 10;
var milliseconds = 100;
var speed = 100;
var colors = ['blue', 'red', 'green', 'black', 'purple', 'pink', 'yellow', 'brown', 'orange'];
var color = {'snake': '','food': ''};
var viewScore = "Score \n\n";

var db = openDatabase('SnakeGame', '1.0', 'User database for record', 2 * 1024 * 1024);

db.transaction(function(tx){
tx.executeSql('CREATE TABLE IF NOT EXISTS USER (ID INTEGER PRIMARY KEY, name TEXT, score INTEGER)');
});

db.transaction(function(tx){
    tx.executeSql('SELECT name, score FROM USER Order by score desc', [], function(tx, result){
        var rows = result.rows;
        var i = 0;
        while(i < rows.length && i < 5){
           viewScore += rows[i].name + " --> " + rows[i].score + "\n";
            i ++;
        }
    });
}, null);

var keyCodes =
{
    '72': function() {
        window.open('help.html');
        pause();

    },
    '13': function() {
        window.location.reload();
        clearInterval(timer);
        isPaused = true;
        start();
    },
    '27': function() {
        if(isPaused){
            continueGame();
        }else{
            pause();
        }
    },
    '16': function() {
        milliseconds -= 5;
        speed += 5;
        setSpeed();
    },
    '17': function() {
        if(speed>50){
            milliseconds += 5;
            speed -= 5;
            setSpeed();
        }
    },
    '65': function() {
        if(direction !== 'right' && !isPaused)
            move('left');
    },
    '87': function() {
        if(direction !== 'down' && !isPaused)
            move('up');
    },
    '68': function() {
        if(direction !== 'left' && !isPaused)
            move('right');
    },
    '83': function() {
        if(direction !== 'up' && !isPaused)
            move('down');
    },
    '89': function() {
       windowRecord();
    }
};

function awake(){
    canvas = document.getElementById('base');
    context = canvas.getContext('2d');
    start();
    enterName();
}

function start(){
    snake = [];
    foodPoint = [];
    length = 3;
    snakePoint = {'x': 250, 'y': 250};
    direction = 'right';
    context.clearRect(0, 0, canvas.width, canvas.height);
    isPaused = false;
    color['snake'] = '#000000';

    setScore();
    updateSnake();
    food();

    timer = setInterval(function(){
        move(direction);
    },milliseconds);
}

function enterName(){
    do {
        userName = prompt ("Enter your Name to start the game:");
        } while (userName == null || userName == "");

        if(userName.length > 10)
            userName = userName.substring(0,10);
}

function windowRecord(){
    alert(viewScore);
}

function setScore(){
    document.getElementById('score').innerText = length - 3;
}

function setSpeed(){
    clearInterval(timer);
    timer = setInterval(function(){
            move(direction);
    },milliseconds);

    document.getElementById('milliseconds').innerText = speed;
}

function updateSnake(){
    if(snake.some(killedHimself)){
        dead();
        return 0;
    }
    snake.push([snakePoint['x'], snakePoint['y']]);
    context.fillStyle = color['snake'];
    context.fillRect(snakePoint['x'], snakePoint['y'], size, size);

    updateSnakeLength();
    snakeFed();
}

function updateSnakeLength(){
    if(snake.length > length){
        body = snake.shift();
        context.clearRect(body[0], body[1], size, size);
    }
}

function snakeFed(){
    if(snakePoint['x'] === foodPoint['x'] && snakePoint['y'] === foodPoint['y']){
        color['snake'] = color['food'];
        length++;
        setScore();
        food();
    }
}

function killedHimself(snake){
    return (snake[0] === snakePoint['x'] && snake[1] === snakePoint['y']);
}

function food(){
    foodPoint = {'x': Math.floor(Math.random() * (canvas.width / size)) * size,
             'y': Math.floor(Math.random() * (canvas.height / size)) * size};

    if(snake.some(foodRespawnSnake)){
        food();
    }
    else{
        color['food'] = colors[Math.floor(Math.random() * colors.length)];
        context.fillStyle = color['food'];
        context.fillRect(foodPoint['x'], foodPoint['y'], size, size);
    }
}

function foodRespawnSnake(snake){
    return (snake[0] === foodPoint['x'] && snake[1] === foodPoint['y']);
}

function move(direction){
    if(direction === 'left'){
        if(position(direction) >= 0)
            executeDirection(direction, 'x', position(direction));
        else
            dead();
    }else if(direction === 'right'){
        if(position(direction) < (canvas.width))
            executeDirection(direction, 'x', position(direction));
        else
            dead();
    }else if(direction === 'up'){
        if(position(direction) >= 0)
            executeDirection(direction, 'y', position(direction));
        else
            dead();
    }else if(direction === 'down'){
        if(position(direction) < canvas.height)
            executeDirection(direction, 'y', position(direction));
        else
            dead();
    }
}

function position(direction){
    if(direction === 'left')
        newPosition = snakePoint['x'] - size;
    else if(direction === 'right')
        newPosition = snakePoint['x'] + size;
    else if(direction === 'up')
        newPosition = snakePoint['y'] - size;
    else if(direction === 'down'){
        newPosition = snakePoint['y'] + size;
    }
    return newPosition;
}

function executeDirection(direction, axis, value){
    this.direction = direction;
    snakePoint[axis] = value;
    updateSnake();
}

function dead(){
    dataBaseNewUser();
    clearInterval(timer);
    isPaused = true;
    document.write('<center><h3>"You died" press Enter</h3><img src="snakedead.gif"></center> <script type= "text/javascript" src="snakedead.js"></script>');
}

function pause(){
    clearInterval(timer);
    isPaused = true;
}

function continueGame(){
    timer = setInterval(function() {
        move(direction);}, milliseconds);
    isPaused = false;
}

document.onkeydown = function(event){
    keyCode = window.event.keyCode;
    keyCodes.hasOwnProperty(keyCode) && keyCodes[keyCode]();
};

function dataBaseNewUser(){
    var newRecord = length - 3;
    db.transaction(function(tx){
        tx.executeSql('SELECT name, score FROM USER WHERE name=? Order by score desc', [userName], function(tx, result){
            if(result.rows.length == 0){
                tx.executeSql('INSERT INTO USER (name, score) VALUES(?, ?)', [userName, newRecord]);
            }else{
                if(result.rows[0].score < newRecord)
                    tx.executeSql('UPDATE USER SET score=? WHERE name=?', [newRecord,userName]);
            }
        });
    });
}
