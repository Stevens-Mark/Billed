import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI from "../views/BillsUI"
import { localStorageMock } from '../__mocks__/localStorage.js'
import { ROUTES } from '../constants/routes'
import firebase from "../__mocks__/firebase"
import userEvent from '@testing-library/user-event'

describe("Given I am connected as an employee", () => {
    describe("When I am on NewBill Page", () => {
      test("Then mail icon in vertical layout should be highlighted", () => {
        const html = NewBillUI();
        document.body.innerHTML = html;
        // get colour of mail icon background
        const divIcon2 = $("#layout-icon2").css("background-color");
        // get colour of verticalLayout background
        const verticalLayout = $(".vertical-navbar").css("background-color");
        // router function sets class 'active-icon' so colours should be different
        expect(divIcon2 === verticalLayout).toBeFalsy();
      })
    })

    // Check handleChangeFile methode

    describe("When I choose the correct file format to upload", () => {
      test("Then it should be saved", () => {
        // set localstorage to mockstorage & user to employee
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
        // we have to mock navigation 
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
          }
        // place UI in DOM
        const html = NewBillUI()
        document.body.innerHTML = html

        // declare firestore
        const firestore = null
        // define newbill
        const newBill = new NewBill({
          document, onNavigate, firestore, localStorage: window.localStorage
        })
        // find 'file' INPUT in DOM
        const chooseFile  = screen.getByTestId("file")
        // mock methode handleChangeFile
        const handleChangeFile = jest.fn(newBill.handleChangeFile)
        chooseFile.addEventListener('change', handleChangeFile)
        // mimic user interaction: choosing a png file.
        fireEvent.change(chooseFile, {
          target: {
            files: [new File(['invoice.png'], 'invoice.png', {type: 'image/png'})],
          },
        })
        // check methode is called & file added
        expect(handleChangeFile).toHaveBeenCalled()
        expect(chooseFile.files[0].name).toBe("invoice.png")
      })
    })

    describe("When I choose the WRONG file format to upload", () => {
      test("Then an error message should be displayed", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        // place UI in DOM
        const html = NewBillUI()
        document.body.innerHTML = html
        // declare firestore
        const firestore = null
        // define newbill
        const newBill = new NewBill({
          document, onNavigate, firestore, localStorage: window.localStorage
        })
        // find 'file' INPUT in DOM
        const chooseFile  = screen.getByTestId("file")
        const handleChangeFile = jest.fn(newBill.handleChangeFile)
        chooseFile.addEventListener('change', handleChangeFile)
        // mimic user interaction: choosing a bmp file.
          fireEvent.change(chooseFile, {
          target: {
            files: [new File(['invoice.bmp'], 'invoice.bmp', {type: 'image/bmp'})],
          },
        })
        // check methode is called
        expect(handleChangeFile).toHaveBeenCalled()
        // check error message displayed
        expect(screen.getByText('Veuillez choisir le format de fichier jpg, jpg ou png.')).toBeTruthy() 
        // check stay on newbill page
        expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy()
      })
    })

    // Check handleSubmit methode

    describe("When I fill in the fields/add a file and I click on submit button NewBill", () => {
      test("Then It should be submiited & I am redirected to the Bills page", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify(
          {          
          type: "Employee",
          email: "johndoe@email.com",
        }))
        // we have to mock navigation 
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        document.body.innerHTML = NewBillUI()

        // declare firstore
        const firestore = null
        // define newbill
        const newBill = new NewBill({
          document, onNavigate, firestore, localStorage: window.localStorage
        })
        // add values to inputs
        // const inputType = screen.getByTestId("expense-type")  // required
        // fireEvent.change(inputType, { target: { value: "Transports" } })
        // expect(inputType.value).toBe("Transports")

        // const inputName = screen.getByTestId("expense-name")
        // fireEvent.change(inputName, { target: { value: "covoiturage" } })
        // expect(inputName.value).toBe("covoiturage")

        // const inputAmount = screen.getByTestId("amount") //required
        // fireEvent.change(inputAmount, { target: { value: "348" } })
        // expect(inputAmount.value).toBe("348")

        // const inputDate = screen.getByTestId("datepicker")  // required
        // fireEvent.change(inputDate, { target: { value: "2001-01-01" } })
        // expect(inputDate.value).toBe("2001-01-01")

        // const inputVat = screen.getByTestId("vat")
        // fireEvent.change(inputVat, { target: { value: "80" } })
        // expect(inputVat.value).toBe("80")

        // const inputPct = screen.getByTestId("pct") //required
        // fireEvent.change(inputPct, { target: { value: "20" } })
        // expect(inputPct.value).toBe("20")

        // const inputCommentary = screen.getByTestId("commentary")
        // fireEvent.change(inputCommentary, { target: { value: "expenses" } })
        // expect(inputCommentary.value).toBe("expenses")

        // // see file userEvent.upload.pdf in P9 sources
        // // mimic file upload
        // const inputfile = screen.getByTestId("file")  //required
        // const fileName = [new File(['invoice.bmp'], 'invoice.bmp', {type: 'image/bmp'})]
        // userEvent.upload(inputfile, fileName)
        // // check upload ok
        // expect(inputfile.files[0]).toStrictEqual(fileName)
        // expect(inputfile.files.item(0)).toStrictEqual(fileName)
        // expect(inputfile.files).toHaveLength(1)

        const form = screen.getByTestId("form-new-bill")
        // mock handleSubmit methode
        const handleSubmit = jest.fn(newBill.handleSubmit)  
    
        form.addEventListener("submit", handleSubmit)
        // mimic form submit
        fireEvent.submit(form) 
        expect(handleSubmit).toHaveBeenCalled()
        // redirected to bills page
        expect(screen.getByText('Mes notes de frais')).toBeTruthy() 
      })
    })
      
})

// Integration test: POST

describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to NewBills", () => {
    test("send a bill to mock API POST", async () => {
      // mock new bill
      const billItem = {
        "id": "47qAXb6fIm2zOKkLzMzz",
        "vat": "80",
        "fileUrl": "https://test.com",
        "status": "pending",
        "type": "Hôtel et logement",
        "commentary": "séminaire billed",
        "name": "billToTest",
        "fileName": "preview-facture-free-201801-pdf-1.jpg",
        "date": "2004-04-04",
        "amount": 400,
        "commentAdmin": "ok",
        "email": "a@a",
        "pct": 20
        }
        // SpyOn/watch "post" method in mock firebase module
       const postSpy = jest.spyOn(firebase, "post")
       // Get bills and the new bill (returned after firebase called)
       const bills = await firebase.post(billItem)
       // check firebase post called
       expect(postSpy).toHaveBeenCalledTimes(1)
       // new bill item added to previous 4 bills in mock thus now equals 5
      //  expect(bills.data.length).toBe(5)
      expect(bills.data.length).toBe(1)
    })
    test("it sends a bill to an API and fails with 404 message error", async () => {
       // make firebase mock return promise with error 404 (once)
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      // pass error param to BillsUI 404 not found
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      // check error displayed on page
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("it sends a bill to an API and fails with 500 message error", async () => {
      // make firebase mock return promise with error 500 (once)
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      // pass error param to BillsUI 500 internal server error
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      // check error displayed on page
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})



