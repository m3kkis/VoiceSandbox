class TextCommands {

    constructor(){
        this.allTextCommands = [];
    }

    addTextCommand(id, text){
        var oneCommand = {
            id : id,
            text : text
        }
        this.allTextCommands.push(oneCommand);
    }

    deleteTextCommand(id){
        var me = this;
        me.allTextCommands.forEach(function(e, index){
            if(id == e.id){
                me.allTextCommands.splice(index, 1);
            }
        });
    }

    deleteAllTextCommand(){
        this.allTextCommands = [];
    }

}