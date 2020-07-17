import { Manpower } from './../classes/manpower';
import { ManpowerService } from './../services/manpower.service';
import { Component, OnInit, AfterContentChecked, ViewChild, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { ApiService } from '../services/api.service';
import { resetFakeAsyncZone } from '@angular/core/testing';
import { UserService } from '../services/user.service';
import * as moment from 'moment';

@Component({
  selector: 'app-manpower',
  templateUrl: './manpower.component.html',
  styleUrls: ['../material/material.component.css', '../manpower/manpower.component.css']
})
export class ManpowerComponent implements OnInit, AfterContentChecked {
  @ViewChildren('tdEditable') tdEditable !: QueryList<ElementRef>;
  positions = [
    {
      position      : 'In-Feeder',
      selected      : 0,
      selected_index: 0
    },
    {
      position      : 'Inspector 1',
      selected      : 0,
      selected_index: 0
    },
    {
      position      : 'Inspector 2',
      selected      : 0,
      selected_index: 0
    },
    {
      position      : 'Roller',
      selected      : 0,
      selected_index: 0
    },
    {
      position      : 'Out-Feeder',
      selected      : 0,
      selected_index: 0
    },
    {
      position      : 'Strapping',
      selected      : 0,
      selected_index: 0
    },
    {
      position      : 'Stamping',
      selected      : 0,
      selected_index: 0
    }
  ];
  manpowers: any = [];
  accounts: Array<any>;
  manpowerSelected = [];
  manpowerOnFocus = 0;
  activeUser;
  userID;
  userType: number;
  isAuthorized: boolean;
  apiResponse: any;

  constructor(public apis: ApiService,
              private manpowerService: ManpowerService,
              private userService: UserService) {
    this.manpowerService.manpower$.subscribe(
      async manpower => {
        this.manpowers = manpower;
        await this.getAllAccounts();
      }
    );
    this.userService.user.subscribe(
      res => {
        if (res) {
          this.activeUser = res;
        }
      },
        err => {
        console.log(err);
      }
    );
  }

  ngAfterContentChecked() {
    (this.activeUser ? this.isAuthorized = this.activeUser.IS_AUTHORIZED : this.isAuthorized = false);
  }

  ngOnInit() {
    // this.getAllAccounts();
  }

  async getAllAccounts() {
    await this.apis.getManpowerList().toPromise()
    .then (
      res => {
        this.accounts = res;
      }
    );
    if (!this.manpowers) {
      this.manpowers = this.manpowerService.manpowers;
    }
    this.manpowers.forEach((el , i) => {
      if (el.MANPOWER_ID > 0) {
        const accIndex = this.accounts.findIndex(x => x.ID === el.MANPOWER_ID);
        this.accounts[accIndex].DISABLED = 1;
        this.positions[i].selected = el.MANPOWER_ID;
        this.positions[i].selected_index = accIndex;
      }
    });
  }

  handleChange(event, i) {
    const currValIndex = event.srcElement.attributes.selected_index.value;
    const options = event.srcElement.options;
    const newValIndex = options.selectedIndex === 1 ? options.selectedIndex : options.selectedIndex - 1;
    console.log(newValIndex);
    if (currValIndex > 0) {
      this.accounts[currValIndex].DISABLED = 0;
    }
    event.srcElement.attributes.selected_index.value = newValIndex;
    if (newValIndex > 0) {
      this.accounts[newValIndex].DISABLED = 1;
    }
    this.manpowers[i].setManpowerID(this.positions[i].selected);
    this.handleInput(i);
  }

  limit(val, key) {
    const pattern = /^['0-9']$/i;
    const count = val.toString().length;

    if (pattern.test(key)) {
      if (count === 4) {
        return false;
      }
    }
  }

  time(value: string, event) {
    const editable = this.tdEditable.toArray();

    const active = editable.findIndex(index => {
      return (index.nativeElement.parentElement === event.target.parentElement);
    });

    if (active < editable.length - 1) {
        editable[active + 1].nativeElement.focus();
    } else {
      event.target.blur();
    }
  }

  formatTime(event, i) {
    const actualVal = event.replace(':', '');
    if (actualVal.length === 4) {
      const intVal = parseInt(actualVal, 10);
      const arr = actualVal.split('');
      const hour = arr[0] + arr[1];
      const min = arr[2] + arr[3];
      const showVal = moment().hours(hour).minutes(min).format('HH:mm');
      this.manpowers[i].START_TIME = showVal;
      console.log(showVal);
     }
  }

  preventEnter(e) {
    e.preventDefault();
  }

  handleInput(i: number) {
    this.manpowers[i].IS_CHANGED = 1;
  }

}
