/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import userEvent from "@testing-library/user-event";

import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js";
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js"
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.getAttribute('class')).toMatch(/active-icon/gi)
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => a - b
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
  
  // describe("When I click on the New Bill button", () => {
  //   test("Then it should display the New Bill Page", async () => {

  //     Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  //     window.localStorage.setItem('user', JSON.stringify({
  //       type: 'Employee'
  //     }))
  //     const root = document.createElement("div")
  //     root.setAttribute("id", "root")
  //     document.body.append(root)
  //     router()
  //     window.onNavigate(ROUTES_PATH.Bills)
  //     await waitFor(() => screen.getByTestId('btn-new-bill'))

  //     document.body.innerHTML = BillsUI({ bills })
  //     const store = null
  //     const containersBills = new Bills ({
  //       document,
  //       onNavigate,
  //       store,
  //       localStorage: window.localStorage,
  //     })
  //     const handleClickNewBill = jest.fn((e) => containersBills.handleClickNewBill(e))
      
  //     const btnNewBill = screen.getByTestId('btn-new-bill')
  //     btnNewBill.addEventListener('click', handleClickNewBill)
  //     userEvent.click(btnNewBill);
  //     expect(handleClickNewBill).toHaveBeenCalled()
  //   })
  // })

  // describe("When I click on the icon eye", () => {
  //   test("Then a modal should open"), () => {
  //     Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  //     window.localStorage.setItem('user', JSON.stringify({
  //       type: 'Employee'
  //     }))

  //     document.body.innerHTML = BillsUI({ bills })
  //     const store = null
  //     const containersBills = new Bills ({
  //       document,
  //       onNavigate,
  //       store,
  //       localStorage: window.localStorage,
  //     })

  //     const iconEye = screen.getByTestId("icon-eye");
  //     const handleClickIconEye = jest.fn(containersBills.handleClickIconEye(iconEye));
  //     iconEye.addEventListener("click", handleClickIconEye);
  //     userEvent.click(iconEye);

  //     expect(handleClickIconEye).toHaveBeenCalled();
  //   }
  // })

  // describe("When it is loading", () => {
  //   test("Then loading page should be rendered"), () => {

  //     const html = BillsUI({ loading: true });
  //     document.body.innerHTML = html;
  //     expect(screen.getAllByText("Loading...")).toBeTruthy();
  //   }
  // })
})

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bill", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      await waitFor(() => screen.getByText("Mes notes de frais"))
      const type  = await screen.getByText("Type")
      expect(type).toBeTruthy()
      const name  = await screen.getByText("Nom")
      expect(name).toBeTruthy()
      const date  = await screen.getByText("Date")
      expect(date).toBeTruthy()
      const montant  = await screen.getByText("Montant")
      expect(montant).toBeTruthy()
      const statut  = await screen.getByText("Statut")
      expect(statut).toBeTruthy()
      const actions  = await screen.getByText("Actions")
      expect(actions).toBeTruthy()
      expect(screen.getByTestId("btn-new-bill")).toBeTruthy()
      expect(screen.getByTestId("tbody")).toBeTruthy()
    })
  })
})
