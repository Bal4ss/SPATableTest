const vEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

Vue.directive('phone', {
    bind(el) {  
        el.oninput = function(e) {
            if (!e.isTrusted) return;
            let x = this.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
            this.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
            el.dispatchEvent(new Event('input'));
        }
    }
});

Vue.directive('mny', {
    bind(el) {  
        el.oninput = function(e) {
            if (!e.isTrusted) return;
            this.value = e.target.value.replace(/[^\d]/g, '');
            el.dispatchEvent(new Event('inputMny'));
        }
    }
});

var _mainBlock = new Vue({
    el: '#mainBlock',
    data: {
        formIsActive: true,
        formText: ["Добавить нового участника","Таблица участников"],
        currBlock: 0,
        filter: [
            {
                text: "по дате рождения",
                value: "date",
            },
            {
                text: "по сумме взноса",
                value: "payment",
            },
            {
                text: "по дистанции забега",
                value: "distance"
            }
        ],
        filterValue: "date",
        personNameValue: "",
        personDateValue: null,
        personEmailValue: "",
        personPhoneValue: "",
        personDistanceValue: 3,
        personMnyValue: Math.floor(Math.random() * 1000),
        distance:[
            {
                text: "3 км",
                value: 3
            },
            {
                text: "5 км",
                value: 5
            },
            {
                text: "10 км",
                value: 10
            }
        ],
        validName: true,
        validDate: true,
        validPhone: true,
        validEmail: true,
        validDistance: true,
        validMny: true,
        validForm: false,
        currPage: 0,
        sizePage: 2,
        users: [
            {
                id: 1,
                date: "11.03.1987",
                name: "Куклина Мария Ивановна",
                email: "kyklina@mail.ru",
                phone: "+79223625999",
                distance: 5,
                payment: 500
            },
            {
                id: 2,
                date: "8.05.1997",
                name: "Мокрушина Галина Юрьевна",
                email: "mokrushina@mail.ru",
                phone: "+79881125999",
                distance: 10,
                payment: 300
            },
            {
                id: 3,
                date: "24.01.1886",
                name: "Ольга Сергеевна Заводская",
                email: "olga.zavodckaia@mail.ru",
                phone: "+79008011000",
                distance: 3,
                payment: 1500
            }
        ]
    },
    methods: {
        ActiveChange() {
            this.formIsActive = !this.formIsActive;
            this.currBlock = (this.currBlock + 1)  % 2;
        },
        IsValidPhone(){
            this.validPhone = this.personPhoneValue.length - this.personPhoneValue.replace(/\d/gm,'').length == 10;
        },
        IsValidEmail(){
            this.validEmail = vEmail.test(this.personEmailValue);
        },
        IsValidDate(){
            this.validDate = this.personDateValue != null;
        },
        IsValidName(){
            this.validName = this.personNameValue != "";
        },
        IsValidMny(){
            this.validMny = this.personMnyValue != "";
        },
        IsValidDistance(){
            this.validDistance = this.personDistanceValue != null;
        },
        RemoveError(valid){
            switch(valid){
                case 'email':
                    this.validEmail = true;
                    break;
                case 'phone':
                    this.validPhone = true;
                    break;
                case 'date':
                    this.validDate = true;
                    break;
                case 'name':
                    this.validName = true;
                    break;
                case 'distance':
                    this.validDistance = true;
                    break;
                case 'mny':
                    this.validMny = true;
                    break;
            }
        },
        IsValidForm(){
            if (this.personMnyValue == '' ||
            this.personNameValue == '' ||
            this.personDateValue == null ||
            this.personDistanceValue == null ||
            !vEmail.test(this.personEmailValue) ||
            this.personPhoneValue.length - this.personPhoneValue.replace(/\d/gm,'').length != 10)
                this.validForm = false;
            else this.validForm = true;
        },
        NextPage(){
            if(this.currPage+1 < Math.ceil(this.users.length / this.sizePage))
                this.currPage++;
        },
        PrevPage(){
            if(this.currPage-1 >= 0)
                this.currPage--;
        },
        UserData(){
            const start = this.currPage * this.sizePage,
            end = start + this.sizePage;
            return this.users.slice(start, end);
        },
        SortUsers(){
            if(this.filterValue == "date") this.users = this.users.sort((a, b) => new Date(a.date) > new Date(b.date) ? 1 : -1);
            else this.users = this.users.sort((a, b) => a[this.filterValue] > b[this.filterValue] ? 1 : -1);
            this.currPage = 0;
        },
        SubmitFomr(event){
            event.preventDefault();
            if(!this.validForm) return;
            var newId = 0;
            for(var item in this.users)
                if (item.id > newId)
                    newId = item.id;
            var newPhone = `+7${this.personPhoneValue.replace(/[\(, ,\),-]/g, "")}`;
            const date = new Date(this.personDateValue)
            const dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: '2-digit', day: 'numeric' }) 
            const [{ value: month },,{ value: day },,{ value: year }] = dateTimeFormat.formatToParts(date); 
            var newItem = {
                id: newId + 1,
                date: `${day}.${month}.${year}`,
                name: this.personNameValue,
                email: this.personEmailValue,
                phone: newPhone,
                distance: this.personDistanceValue,
                payment: this.personMnyValue
            }
            this.users.push(newItem);
            this.personMnyValue = Math.floor(Math.random() * 1000);
            this.personNameValue = "";
            this.personEmailValue = "";
            this.personPhoneValue = "";
            this.personDateValue = null;
            this.personDistanceValue = 3;
        }
    }
});

_mainBlock.SortUsers();