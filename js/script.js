grid_setup();
//populate  grid

//Space for Arrays.Objects and Global Variables
const weaponsArray = [
    {name: 'Meteor', power: 20, x: 0, y: 0, beenEquipped: false},
    {name: 'Moon', power: 15, x: 0, y: 0, beenEquipped: false},
    {name: 'Sun', power: 18, x: 0, y: 0, beenEquipped: false},
    {name: 'Wind', power: 17, x: 0, y: 0, beenEquipped: false}
];
const usersArray = [
    {username: 'P1',name: 'user1', health: 100, x: 0, y: 0,pname: 'Default', power: 10, has_moved: false, color: 'legal1', isAttacking: true},
    {username: 'P2',name: 'user2', health: 100, x: 0, y: 0,pname: 'Default', power: 10,has_moved: true, color: 'legal2', isAttacking: true},
];
//holds 18 unique numbers --- 0-11 -> Obstacles --- 11-15 -> Weapons --- 15-17 -> 
let unique_cordinates = [];
let obstaclesArray = [];
let current_player = usersArray[0];
let toggler = 0;
let round = 0;

//Populate 10x10 Grid
function grid_setup(){
    for (let x = 0; x < 10; x++){
        for (let y = 0; y < 10; y++){
            $('.grid-container').append(
                '<div class = "grid-item z-depth-1 waves-effect" data-x = ' + x +' data-y = ' + y + '></div>'
            )
        }
    }
    console.log("Grid Setup");
}
// get 100 array for grind items
const blocks = $('.grid-item').toArray();

function populate_obstacles(){
    
    for( let i = 0; i<12;i++){
        obsX = Math.floor(unique_cordinates[i]/10);
        obsY = Math.floor(unique_cordinates[i]%10);

        for ( k = 0; k<blocks.length; k++){
            let statusX = parseInt(blocks[k].dataset.x) === obsX;
            let statusY = parseInt(blocks[k].dataset.y) === obsY;
            if( statusX && statusY){
                blocks[k].classList.add('disabled')
            }
        }
    }
}

//populate weapons and users
function populate_items(array, offset){
    for( let i = 0; i<array.length;i++){
        obsX = Math.floor(unique_cordinates[i+offset]/10);
        obsY = Math.floor(unique_cordinates[i+offset]%10);
        
        array[i].x = obsX;
        array[i].y = obsY;

        for ( k = 0; k<blocks.length; k++){
            let statusX = parseInt(blocks[k].dataset.x) === obsX;
            let statusY = parseInt(blocks[k].dataset.y) === obsY;
            if( statusX && statusY){
                blocks[k].classList.add(array[i].name)
            }
        }
    }
}

//returns unique coordinates
function unique_array(count){
    while ( unique_cordinates.length < count){
        var r = Math.floor(Math.random() * 100);
        
        var check = $.inArray( r, unique_cordinates);
        if(check === -1){
            unique_cordinates.push(r);
        }
    }    
}

//check if users are too close then seperate them.
function check_users(){
    if ((unique_cordinates[16] > 49) && (unique_cordinates[17]) > 49 ){
        console.log(unique_cordinates[16])
        unique_cordinates[16] -= 48;
        var check = $.inArray( unique_cordinates[16], unique_cordinates);
        if(check > -1){
            console.log(unique_cordinates[16] + " duplicate found")
            unique_cordinates[16] = (unique_cordinates[16] +8)%100;
        }
        console.log(" changed to -> " + unique_cordinates[16]);
    }
    if ((unique_cordinates[16] < 49) && (unique_cordinates[17]) < 49 ){
        console.log(unique_cordinates[16])
        unique_cordinates[16] += 48;
        var check = $.inArray( unique_cordinates[16], unique_cordinates);
        if(check > -1){
            console.log(unique_cordinates[16] + " duplicate found")
            unique_cordinates[16] = (unique_cordinates[16] +7)%100;
        }
        console.log(" changed to => " + unique_cordinates[16]);
    }
}

//for current player's position check legal moves
let legal_moves = [];
function check_legal_moves(x,y){
    let number = x*10 + y;
    let temp_legal_moves = []
    let range = -3;
    let temp_num = number;
    //along x
    for(let i = 0; i<7; i++){
        temp_num += range + i;
        if(!(temp_num < 0) && !(temp_num > 100) && (temp_num < (x+1)*10) && (temp_num >= x*10)){
            temp_legal_moves.push(temp_num);
        }
        temp_num = number;

        temp_num += (range*10) + (i*10);
        if(!(temp_num < 0) && !(temp_num > 100)){
            temp_legal_moves.push(temp_num);
        }
        temp_num = number;
    }

    obstaclesArray = unique_cordinates.slice(0,12);
    //console.log("Obstacles:" + obstaclesArray)
    //console.log("Temp Legal: " + temp_legal_moves)

    legal_moves = temp_legal_moves.filter(function(val) {
        return obstaclesArray.indexOf(val) == -1;
       });
    //console.log("False Legal Moves:" + legal_moves);

    remove_false_legal(number);
    show_legal_moves();
}

//move to a box that is included in legal moves array
function move_to_legal(moveFrom,moveTo){

    if(legal_moves.includes(moveTo)){
        blocks[moveFrom].classList.remove(current_player.name)

        current_player.x = Math.floor(moveTo/10);
        current_player.y = Math.floor(moveTo%10);
        console.log(current_player.username, "has moved to", current_player.x,current_player.y);
        blocks[moveTo].classList.add(current_player.name)
        show_legal_moves();
        update_weapons();
        
        if(check_fight()){
            indicate_battle();
        } 
        else{
            toggle_player();
            indicate_peace();
        }

    }
    else{
        console.log("Invalid Move Try Again.")
    }
}

function check_fight() {
    let range = -1;
    let other_player;
    (toggler%2==0) ? other_player = usersArray[1] : other_player = usersArray[0];
    let current_location = current_player.x*10 + current_player.y;
    let temp_location = current_location;
    let inactive_location = other_player.x*10 + other_player.y;

    console.log("Checking Fight");
    console.log("Active User:",current_player.username,current_player.x,current_player.y);
    console.log("Inactive User:",other_player.username,other_player.x,other_player.y);

    for(let i = 0; i<3; i++){
        temp_location += range + i;
        if(temp_location == inactive_location){
            console.log("Enemy Spotted on Horizontal Axis")
            console.log(current_player.username,"can initiate attack.");
            return true
        }
        temp_location = current_location;

        temp_location += range*10 + i*10;
        if(temp_location == inactive_location){
            console.log("Enemy Spotted on Vertical Axis")
            console.log(current_player.username,"can initiate attack.");
            return true;
        }
        temp_location = current_location;
    }
    return false;
}

function indicate_battle(){
    if(toggler%2==0){
        $('#textP21').empty()
        $('#textP11').empty().append(` ${usersArray[0].username} choose Attack or Defend.`);
        $('#p1btn').show();
        $('#p2btn').hide();
    }
    else{
        $('#textP11').empty()
        $('#textP21').empty().append(` ${usersArray[1].username} choose Attack or Defend.`);
        $('#p2btn').show();
        $('#p1btn').hide();

    }

}

function indicate_peace(){
        $('#textP11').empty();
        $('#textP21').empty();
        $('#p1btn').hide();
        $('#p2btn').hide();


}

function commence_round(){
    if(usersArray[0].isAttacking && usersArray[1].isAttacking){
        console.log(usersArray[0].username,"Attacking");
        console.log(usersArray[1].username,"Attacking");
        usersArray[0].health - usersArray[1].power <= 0 ? usersArray[0].health = 0 : usersArray[0].health -= usersArray[1].power;
        usersArray[1].health - usersArray[0].power <= 0 ? usersArray[1].health = 0 : usersArray[1].health -= usersArray[0].power;
    }
    if(usersArray[0].isAttacking && !usersArray[1].isAttacking){
        console.log(usersArray[0].username,"Attacking");
        console.log(usersArray[1].username,"Defending");
        usersArray[1].health - parseInt(usersArray[0].power/2) <= 0 ? usersArray[1].health = 0: usersArray[1].health -= parseInt(usersArray[0].power/2);

    }
    if(!usersArray[0].isAttacking && usersArray[1].isAttacking){
        console.log(usersArray[0].username,"Defending");
        console.log(usersArray[1].username,"Attacking");
        usersArray[0].health - parseInt(usersArray[1].power/2) <= 0 ? usersArray[0].health = 0: usersArray[0].health -= parseInt(usersArray[1].power/2);
    }
    if(!usersArray[0].isAttacking && !usersArray[1].isAttacking){
        console.log(usersArray[0].username,"Defending");
        console.log(usersArray[1].username,"Defending");
    }
    show_status();
    show_legal_moves();
    check_victory();
}

function check_victory(){
    if(usersArray[0].health <= 0){
        console.log(usersArray[1].username, "WON!!");
        console.log(usersArray[0].username, "LOST!")
        $('#success').append(
            `<div class="alert alert-success" role="alert">
            ${usersArray[1].username} WON!!! New Game Starts in 5s
            </div>`
            );
            setTimeout(function() { restart();}, 5000);
    }
    else if(usersArray[1].health <= 0){
        console.log(usersArray[0].username, "WON!!");
        console.log(usersArray[1].username, "LOST!")
        $('#success').append(
            `<div class="alert alert-success" role="alert">
            ${usersArray[0].username} WON!!! New Game Starts in 5s
            </div>`
            );
            setTimeout(function() { restart();}, 5000);
    }
}

function toggle_player(){
    if ((toggler%2) === 0){
        usersArray[0].has_moved =true;
        usersArray[1].has_moved =false;
        remove_legal_moves();
        current_player = usersArray[1];          
        toggler+=1;
        show_status();
        check_legal_moves(current_player.x,current_player.y);
    }
    else if ((toggler%2) === 1){
        usersArray[1].has_moved =true;
        usersArray[0].has_moved =false;
        remove_legal_moves();
        current_player = usersArray[0];            
        toggler+=1;
        show_status();
        check_legal_moves(current_player.x,current_player.y);
    }
}

//removes legal moves when obstacles are present.
function remove_false_legal(number){
    let xIterate = 1;
    let yIterate = 10;
    //removing right side
    if(obstaclesArray.includes(number+xIterate)){
        if(legal_moves.indexOf(number+2) > -1){
            legal_moves.splice(legal_moves.indexOf(number+2),1)
            //console.log("Removing-R: ",number+2)

        }
        if(legal_moves.indexOf(number+3) > -1){
            legal_moves.splice(legal_moves.indexOf(number+3),1)
            //console.log("Removing-R: ",number+3 )
        }
    }
    else if(obstaclesArray.includes(number + xIterate + xIterate )){
        if(legal_moves.indexOf(number+3) > -1){
            legal_moves.splice(legal_moves.indexOf(number+3),1)
            //console.log("Removing-R: ",number+3 )
        }
    }
    //console.log("False Legal Removed from right: ",legal_moves)

    //removing from left side
    if(obstaclesArray.includes(number-xIterate)){
        if(legal_moves.indexOf(number-2) > -1){
            legal_moves.splice(legal_moves.indexOf(number-2),1)
            //console.log("Removing-L: ",number-3 )
    
        }
        if(legal_moves.indexOf(number-3) > -1){
            legal_moves.splice(legal_moves.indexOf(number-3),1)
            //console.log("Removing-L: ",number-3 )
    
        }
    }
    else if(obstaclesArray.includes(number - xIterate - xIterate )){
        if(legal_moves.indexOf(number-3) > -1){
            legal_moves.splice(legal_moves.indexOf(number-3),1)
            //console.log("Removing-L: ",number-3 )
    
        }
    }
    //console.log("False Legal Removed from left: ",legal_moves)

    //removing from bottom side
    if(obstaclesArray.includes(number+yIterate)){
        if(legal_moves.indexOf(number+20) > -1){
            legal_moves.splice(legal_moves.indexOf(number+20),1)
            //console.log("Removing-B: ",number+20)
        }
        if(legal_moves.indexOf(number+30) > -1){
            legal_moves.splice(legal_moves.indexOf(number+30),1)
            //console.log("Removing-B: ",number+30 )
        }

    }
    else if(obstaclesArray.includes(number + yIterate + yIterate )){
        if(legal_moves.indexOf(number+30) > -1){
            legal_moves.splice(legal_moves.indexOf(number+30),1)
            //console.log("Removing-B: ",number+30 )
        }
    }
    //console.log("False Legal Removed from bottom: ",legal_moves)
    
    //removing from top side
    if(obstaclesArray.includes(number - yIterate)){
        if(legal_moves.indexOf(number-20) > -1){
            legal_moves.splice(legal_moves.indexOf(number-20),1)
            //console.log("Removing-T: ",number-20)
        }
        if(legal_moves.indexOf(number-30) > -1){
            legal_moves.splice(legal_moves.indexOf(number-30),1)
            //console.log("Removing-T: ",number-30 )
        }

    }
    else if(obstaclesArray.includes(number - yIterate - yIterate )){
        if(legal_moves.indexOf(number-30) > -1){
            legal_moves.splice(legal_moves.indexOf(number-30),1)
            //console.log("Removing-T: ",number-30 )
        }
    }
    //console.log("False Legal Removed from top: ",legal_moves)
}

//display legal moves on board for current player
function show_legal_moves(){
    for(let j = 0; j < legal_moves.length; j++){
        blocks[legal_moves[j]].classList.add(current_player.color)

    }
}

//remove legal moves from board for current player
function remove_legal_moves(){
    for(let j = 0; j < legal_moves.length; j++){
        blocks[legal_moves[j]].classList.remove(current_player.color)

    }
}

function getData(){
    let p1 = $('#p1Name').val();
    let p2 = $('#p2Name').val();

    console.log(p1,p2)

    if(p1.length)
        usersArray[0].username = p1;
    if(p2.length)
        usersArray[1].username = p2;
    show_status();
}

//update active player, power and health
function show_status(){
    $('#textP2').empty().append(`Health: ${usersArray[1].health} <br>Power: ${usersArray[1].pname} <br>Damage: ${usersArray[1].power} <br>Attack Mode: ${usersArray[1].isAttacking}`)
    $('#textP1').empty().append(`Health: ${usersArray[0].health} <br>Power: ${usersArray[0].pname} <br>Damage: ${usersArray[0].power} <br>Attack Mode: ${usersArray[0].isAttacking}`)

    if ((toggler%2) === 1){
        $('#nameP1').empty().append(`${usersArray[0].username} <i class="far fa-circle fa-1x inactive"></i> `)
        $('#nameP2').empty().append(`${usersArray[1].username} <i class="fas fa-circle fa-1x active"></i> `)
    }
    if ((toggler%2) === 0){
        $('#nameP1').empty().append(`${usersArray[0].username} <i class="fas fa-circle fa-1x active"></i> `)
        $('#nameP2').empty().append(`${usersArray[1].username} <i class="far fa-circle fa-1x inactive"></i> `)
    }

}

//see if the user is on the box with weapon
function update_weapons(){

    if(current_player.x == weaponsArray[0].x && current_player.y == weaponsArray[0].y && !weaponsArray[0].beenEquipped ){
        let old_power = current_player.pname;
        current_player.power = weaponsArray[0].power;
        current_player.pname = weaponsArray[0].name;
        weaponsArray[0].beenEquipped = true;
        pickNdrop(old_power, weaponsArray[0].name);
    }
    else if(current_player.x == weaponsArray[1].x && current_player.y == weaponsArray[1].y && !weaponsArray[1].beenEquipped ){
        let old_power = current_player.pname;
        current_player.power = weaponsArray[1].power;
        current_player.pname = weaponsArray[1].name;
        weaponsArray[1].beenEquipped = true;
        pickNdrop(old_power, weaponsArray[1].name);     
    }
    else if(current_player.x == weaponsArray[2].x && current_player.y == weaponsArray[2].y && !weaponsArray[2].beenEquipped ){
        let old_power = current_player.pname;
        current_player.power = weaponsArray[2].power;
        current_player.pname = weaponsArray[2].name;
        weaponsArray[2].beenEquipped = true;
        pickNdrop(old_power, weaponsArray[2].name);
    }
    else if(current_player.x == weaponsArray[3].x && current_player.y == weaponsArray[3].y && !weaponsArray[3].beenEquipped ){
        let old_power = current_player.pname;
        current_player.power = weaponsArray[3].power;
        current_player.pname = weaponsArray[3].name;
        weaponsArray[3].beenEquipped = true;
        pickNdrop(old_power, weaponsArray[3].name);
    }

    show_status(); 
}

//swap powers
function pickNdrop( old_power, new_power){
    console.log(current_player.username, ": ", old_power,"->",new_power);
    if(old_power == 'Default'){
        blocks[current_player.x*10+current_player.y].classList.remove(new_power);
        console.log(new_power, "taken from",current_player.x*10+current_player.y);
    }
    else{
        let old_index = weaponsArray.findIndex(x => x.name == old_power);
        console.log("index of old weapon",old_index)
        weaponsArray[old_index].beenEquipped = false;
        
        weaponsArray[old_index].x = current_player.x;
        weaponsArray[old_index].y = current_player.y;

        blocks[current_player.x*10+current_player.y].classList.remove(new_power);
        blocks[current_player.x*10+current_player.y].classList.add(old_power);

        console.log(old_power, "droped on",current_player.x*10+current_player.y);
        console.log(new_power, "taken from",current_player.x*10+current_player.y);
    }
}

function restart(){
    location.reload();
}

$('.grid-item').click(function (){
    console.clear();
    clickedX = parseInt($(this)[0].attributes[1].value);
    clickedY = parseInt($(this)[0].attributes[2].value);
    console.log("Square clicked: " + clickedX,clickedY);
    let moveTo = clickedX*10+clickedY;
    let moveFrom = current_player.x*10+current_player.y;
    move_to_legal(moveFrom,moveTo)
     
})

$('#start').one( "click", function(){
    check_legal_moves(usersArray[0].x,usersArray[0].y);
    $('#stop').show();
    $('#start').hide();

})
$('#stop').one( "click", function(){
    restart();
    $('#stop').hide();
})

$('#p1f').click(function (){
    usersArray[0].isAttacking = true;
    console.log(usersArray[0].username + " is attacking ? ", usersArray[0].isAttacking);
    toggle_player();
    remove_legal_moves();
    indicate_battle();
    show_status();
    round+=1;
    round%2==0 ? commence_round() :  console.log("");
})

$('#p1d').click(function (){
    usersArray[0].isAttacking = false;
    console.log(usersArray[0].username + " is attacking ? ", usersArray[0].isAttacking);
    toggle_player();
    remove_legal_moves();
    indicate_battle();
    show_status();
    round+=1;
    round%2==0 ? commence_round() :  console.log("");

})

$('#p2f').click(function (){
    usersArray[1].isAttacking = true;
    console.log(usersArray[1].username + " is attacking ? ", usersArray[1].isAttacking);
    toggle_player();
    remove_legal_moves();
    indicate_battle();
    show_status();
    round+=1;
    round%2==0 ? commence_round() :  console.log("");

})

$('#p2d').click(function (){
    usersArray[1].isAttacking = false;
    console.log(usersArray[1].username + " is attacking ? ", usersArray[1].isAttacking);
    toggle_player();
    remove_legal_moves();
    indicate_battle();
    show_status();
    round+=1;
    round%2==0 ? commence_round() :  console.log("");

})

$(document).ready(function(){
    $('#stop').hide();
})

unique_array(18);
populate_obstacles();
check_users();
populate_items(weaponsArray,12);
populate_items(usersArray,16)
show_status();
indicate_peace();





