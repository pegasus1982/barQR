var StatusModal = function(title,totalCount){
    this.totalCount = 0;
    this.currentCount = 0;
    this.createModal = function(title,totalCount){
        this.totalCount = totalCount;
        var width = $(document).width();
        var height = $(document).height();
        console.log(width,height)

        var _self = this;

        $(window).scrollTop(0)
        $('body').css('overflow','hidden');
        $('body').append('<div class="modal-container"></div>');
        $('.modal-container').append('<div class="custom-modal-title">'+title+'</div><div class="custom-modal-status">'+_self.currentCount +' / '+totalCount+'</div>')

        $('.modal-container').append('<div class="custom-progress-container"><div class="custom-progress-bar"></div></div>')
    }

    this.updateModal = function(currentCount){
        var _self = this;
        _self.currentCount = currentCount;
        $('.custom-modal-status').html(_self.currentCount +' / '+_self.totalCount);
        var ratio = _self.currentCount / _self.totalCount;
        var fullWidth = $('.custom-progress-container').width();
        console.log(fullWidth)
        $('.custom-progress-bar').css('width',(ratio*fullWidth)+'px');
    }

    this.removeModal = function(){
        $('.modal-container').remove();
        $('body').css('overflow','auto');
    }
    this.createModal(title,totalCount);
}