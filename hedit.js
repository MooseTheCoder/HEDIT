const console = require('terminal-kit').terminal; // console = terminal-kit
const fs = require('fs');

var _PLATFORM = process.platform; // Global Platform Var
var _HOST_LOC; // Global host file location

// Function to clear terminal screen
function c_clear(){
    console.clear();
}

// Set a "title"
function c_i_title(title){
    console.magenta.underline.bold(title);
}

// Exit the application
function exit_c_a(code){
    process.exit(code);
}

// Ensure a hosts file exists somewhere
function check_hosts_file(){
    console('Checking Hosts File...\n\n');
    switch(_PLATFORM){
        case 'win32':
            _HOST_LOC = 'C:\\Windows\\System32\\Drivers\\etc\\hosts';
            break;
        case 'linux':
            _HOST_LOC = '/etc/hosts'
    }
    if(fs.existsSync(_HOST_LOC)){
        console.green(_HOST_LOC+'\n');
        return true;
    }else{
        console.red('Hosts file not found. Is your OS supported?\n');
        return false;
    }
}

// Parse the hosts file and only return entries that matter
function parse_hosts(with_core){
    var rawHosts = fs.readFileSync(_HOST_LOC,'utf8');
    var lines = rawHosts.split(/\r?\n/);
    menuItems = [];
    lines.forEach((line)=>{
        t_line = line.trim();
        if(t_line[0] != '#' && t_line){
            menuItems.push(line);
        }
    });
    if(with_core){
        menuItems.push('New Entry');
        menuItems.push('Exit HEDIT');
    }
    return menuItems;
}

// Render the main menu
function render_main_menu(menu_items){
    c_clear();
    c_i_title('HEDIT - Hosts Editor\n');
    console.red('!!HEDIT WILL REMOVE ALL HOST FILE COMMENTS AND BLANK SPACES!!\n')
    console.singleColumnMenu(menu_items, [] , (e,res)=>{
        isCore = false;
        if(res.selectedIndex == (menu_items.length - 1 )){
            exit_c_a(1);
        }
        if(res.selectedText === "New Entry"){
            isCore = true;
            new_entry();
        }
        // Not a default menu item, editing existing host
        if(!isCore){
            select_entry(res.selectedText);
        }
    });
}

// Render the menu for a selected item
function select_entry(to_edit){
    c_clear();
    c_i_title('HEDIT - Edit '+to_edit+'\n\n');
    console.singleColumnMenu(['Delete','Back'] , [] , (e, res)=>{
        if(res.selectedIndex === 1){
            render_main_menu(parse_hosts(true));
        }
        if(res.selectedIndex === 0){
            var hosts = parse_hosts();
            var entry_index;
            hosts.forEach((host, index)=>{
                if(host === to_edit){
                    console.red('Removing ' + to_edit+'\n\n');
                    entry_index = index;
                }
            });
            hosts.splice(entry_index,1);
            write_array(hosts)
            render_main_menu(parse_hosts(true));
        }
    })
}

// Write an array to the hosts file
function write_array(hosts){
    hosts = hosts.join('\r\n');
    fs.writeFileSync(_HOST_LOC, hosts);
}

// Write a string to the hosts file
function append_string(host){
    fs.appendFileSync(_HOST_LOC,'\r\n'+host+'\r\n');
}

// Create a new entry
function new_entry(){
    c_clear();
    c_i_title('HEDIT - New Host\n\n');
    var addr;
    var fqdn;
    console('Enter Address: ');
    console.inputField({default:'127.0.0.1'}, (error, input)=>{
        addr = input;
        console('\nEnter FQDN: ');
        console.inputField({}, (error, input)=>{
            fqdn = input;
            append_string(addr+' '+fqdn);
            render_main_menu(parse_hosts(true));
        });
    });
}

// Output the contents of an array
function loop_out_array(arr){
    arr.forEach((item) => {
        console(item+'\n');
    })
}

// If a hosts file exists, render the menu
if(check_hosts_file()){
    render_main_menu(parse_hosts(true));
}else{
    exit_c_a(1);
}