/**
 * @jest-environment jsdom
 */

import NewBillUI from "../views/NewBillUI.js"
import Bills from "../containers/NewBill.js"
import NewBill from "../containers/NewBill.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page and I choose a file that is not JPG, JPEG or PNG", () => {
    test("Then a message error should appears", () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      document.body.innerHTML = NewBillUI();
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES_PATH({ pathname });
      };
      const store = mockStore
      const containersBills = new Bills ({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      })

      const handleChangeFile = jest.fn(containersBills.handleChangeFile)
      const inputFile = screen.getByTestId("file")
      inputFile.addEventListener("change", handleChangeFile)
      
      fireEvent.change(inputFile, {
        target: {
          files: [
            new File(["document.pdf"], "document.pdf", {
              type: "application/pdf",
            }),
          ],
        }
      })
      expect(handleChangeFile).toHaveBeenCalled();
      expect(inputFile.files[0].name).toBe("document.pdf");

      const message = screen.getByTestId("file-message-error");
      expect(message).toBeTruthy()
    })
  })
  describe("WHEN I am on NewBill page and I submit a correct form", () => {
    test("THEN I should be redirected to Bills page", () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = NewBillUI();

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null
      const containersBills = new NewBill ({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      })

      const handleSubmit = jest.fn(containersBills.handleSubmit);
      containersBills.fileName = "test.png";
      const formBill = screen.getByTestId("form-new-bill");
      formBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(formBill);

      expect(handleSubmit).toHaveBeenCalled();
    })
  })
})

// test d'intégration POST new bill

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then I create a new bill", async () => {

      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)

      const billNew = {
        id: "47qAXb6fIm2zOKkLzMro",
        vat: "80",
        fileUrl: "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        status: "pending",
        type: "Hôtel et logement",
        commentary: "séminaire billed",
        name: "encore",
        fileName: "preview-facture-free-201801-pdf-1.jpg",
        date: "2004-04-04",
        amount: 400,
        commentAdmin: "ok",
        email: "a@a",
        pct: 20
      }
      const store = mockStore
      const containersBills = new NewBill ({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      })   

      const form = screen.getByTestId('form-new-bill')
      const handleSubmit = jest.fn((e) => containersBills.handleSubmit(e))
      form.addEventListener('submit', handleSubmit)
      fireEvent.submit(form)
      expect(handleSubmit).toHaveBeenCalled()

      const post = jest.spyOn(containersBills, 'updateBill')
      const data = await containersBills.updateBill(billNew)
      // const lengthData = data.length

      expect(post).toHaveBeenCalledTimes(1)
      // expect(lengthData).toBe(4)
    })
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(window,'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
        }))
        document.body.innerHTML = NewBillUI();
      })
      test("Then there is a error 404", async () => {
  
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 404"))
            }
          }})
        const html = NewBillUI({ error: "Erreur 404" });
        document.body.innerHTML = html;
        const message = screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })
      test("Then there is a error 500", async () => {
  
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }})
        const html = NewBillUI({ error: "Erreur 500" });
        document.body.innerHTML = html;
        const message = screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })
  })
})