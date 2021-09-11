import { screen, fireEvent } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import firebase from "../__mocks__/firebase"
import { localStorageMock } from '../__mocks__/localStorage.js';
import { ROUTES } from '../constants/routes';
import Bills from '../containers/Bills.js'
// import Firestore from "../app/Firestore";
// import Router from "../app/Router";


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    
    test("Then bill icon in vertical layout should be highlighted", () => {
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;
      //get colour of bill icon background (see P9 sources)
      const divIcon1 = $("#layout-icon1").css("background-color");
      // get colour of verticalLayout background
      const verticalLayout = $(".vertical-navbar").css("background-color");
      // router function sets class 'active-icon' so colours should be different
      expect(divIcon1 === verticalLayout).toBeFalsy();
    })

    // this test failed previously, so code added to rectify test (date sort error bug)

    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      // regex for french format: 1 jan. 21
     const dates = screen.getAllByText(/(?<day>\d?\d)\s+(?<month>\w.+)[.]\s+(?<year>\d\d)/).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    // next two tests basically the same as on dashboard tests
    // replace DashboardUI for BillsUI

    describe('When I am on Bills page but it is loading', () => {
      test('Then, Loading page should be rendered', () => {
        const html = BillsUI({ loading: true })
        document.body.innerHTML = html
        expect(screen.getAllByText('Loading...')).toBeTruthy()
      })
    })
    describe('When I am on Bills page but back-end send an error message', () => {
      test('Then, Error page should be rendered', () => {
        const html = BillsUI({ error: 'some error message' })
        document.body.innerHTML = html
        expect(screen.getAllByText('Erreur')).toBeTruthy()
      })
    })

    // check handleClickIconEye methode

    describe('When Im on a bill & I click on the icon eye', () => {
      test('Then A modal should open', () => {
        // set localstorage to mockstorage & user to employee
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        // place UI in DOM
        const html = BillsUI({ data: bills })
        document.body.innerHTML = html

       // declare firestore
        const firestore = null
        // define billitem
        const billItem = new Bills({
          document, onNavigate, firestore, localStorage: window.localStorage
        })
        // mock bootstrap modal function (see P9 sources folder)
        $.fn.modal = jest.fn()
        // mock methode handleClickIconEye 
        const handleClickIconEye = jest.fn(billItem.handleClickIconEye)
        // find eye icon buttons in DOM
        const iconEye = screen.getAllByTestId('icon-eye')
        // add event listeners to eye icons
        iconEye.forEach((icon) => { 
          icon.addEventListener('click', (e) => handleClickIconEye(icon))
        // mimic user interaction
        userEvent.click(icon)
        })
        // check methode is called
        expect(handleClickIconEye).toHaveBeenCalled()
        // check Modal opened by searching for its ID
        const modale = document.getElementById('modaleFile')
        expect(modale).toBeTruthy()
      })
    })

    // check handleClickNewBill methode

    describe('When I click on the New bill button', () => {
      test("Then A new Bill Page is displayed", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        // place UI in DOM
        const html = BillsUI({ data: bills })
        document.body.innerHTML = html
        // declare firestore
        const firestore = null
        // define billitem
        const billItem = new Bills({
          document, onNavigate, firestore, localStorage: window.localStorage
        })
        // mock methode handleClickNewBill when button clicked
        const handleClickNewBill = jest.fn(billItem.handleClickNewBill);
        // access button & add eventlistener
        const buttonNewBill = screen.getByTestId('btn-new-bill')
        buttonNewBill.addEventListener('click', handleClickNewBill)
        // mimic user interaction
        fireEvent.click(buttonNewBill)
        // check methode is called 
        expect(handleClickNewBill).toHaveBeenCalled()
        // title & form diplayed (ie, NewBillUI is loaded)
        expect(screen.getByTestId("form-new-bill")).toBeTruthy()
        expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy()
      })
    })

  })
})

// test d'intégration GET (basically the same as integration test from dashboard)
// change DashboardUI to BillsUI

describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("Then it fetches bills from mock API GET", async () => {
      // SpyOn/watch "get" method in mock firebase module
       const getSpy = jest.spyOn(firebase, "get")
       // Get bills (returned after firebase called)
       const bills = await firebase.get()
       // check firebase get called
       expect(getSpy).toHaveBeenCalledTimes(1)
       // length should equal data in mock
       expect(bills.data.length).toBe(4)
    })
    test("Then it fetches bills from an API and fails with 404 message error", async () => {
      // make firebase mock return promise with error 404 (once)
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("Then it fetches messages from an API and fails with 500 message error", async () => {
      // make firebase mock return promise with error 500 (once)
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})


// describe("Given I am connected as an employee", () => {
//   describe("When I am on Bills Page", () => {
//     test("Then bill icon in vertical layout should be highlighted", () => {
//       // set localstorage to mockstorage & user to employee
//       Object.defineProperty(window, 'localStorage', { value: localStorageMock })
//       window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
//       // sets hash to #employee/bills
//       Object.defineProperty(window, "location", { value: { hash: ROUTES_PATH["Bills"] } })
//       // Mock Firestore
//       jest.mock("../app/Firestore");
//       Firestore.bills = () => ({ bills, get: jest.fn().mockResolvedValue() });
//       // place UI in DOM
//       const html = BillsUI({ data: [] })
//       document.body.innerHTML = html   
//       document.body.innerHTML = `<div id="root"></div>`;
//       // call router (sets CSS class to active-icon) 
//       Router();
//       expect(
//         screen.getByTestId("icon-window").classList.contains("active-icon")
//       ).toBe(true);

//     })
//   })
// })

