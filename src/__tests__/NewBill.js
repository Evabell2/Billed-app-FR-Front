/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import userEvent from "@testing-library/user-event";
import NewBillUI from "../views/NewBillUI.js"
import Bills from "../containers/NewBill.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js"

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
      const store = null
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

      // const error = screen.getByTestId("message-error");

      // expect(error.textContent).toEqual(
      //   expect.stringContaining("JPG, JPEG ou PNG uniquement")
      // );
      //to-do write assertion
    })
  })
})

// test d'intégration POST new bill
// describe("Given I am connected as an employee", () => {
//   describe("When I am on NewBill Page", () => {
//     test("Then I create a new bill", async () => {
//       document.body.innerHTML = NewBillUI()

//       const onNavigate = (pathname) => {
//         document.body.innerHTML = ROUTES(pathname)
//       }
//       const newBill = new NewBill({
//         document,
//         onNavigate,
//         store: mockStore,
//         bills: bills,
//         localStorage: window.localStorage,
//       })
//       const btninput = screen.getByLabelText('Envoyer')
//       const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
//       btninput.addEventListener('click', handleSubmit)

//       const create = jest.fn(mockStore.bills().create)
//       const bill = await create()
//       expect(create).toHaveBeenCalled()

//       expect(bill.type).toBe("Equipement et matériel")
//       expect(bill.name).toBe("Ordinateur portable")
//       expect(bill.date).toBe("2004-04-04")
//       expect(bill.amount).toBe(348)
//       expect(bill.vat).toBe("70")
//       expect(bill.pct).toBe(20)
//       expect(bill.commentary).toBe("Achat d'un ordinateur portable pour les déplacements")
//       expect(bill.fileName).toBe("capture.png")
//     })
//   })
// })