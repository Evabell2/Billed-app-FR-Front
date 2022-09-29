/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import {localStorageMock} from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
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
  
  describe("When I click on the New Bill button", () => {
    test("Then it should display the New Bill Page", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = BillsUI({ bills });
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('btn-new-bill'))
      const btnNewBill = screen.getByTestId('btn-new-bill')

      const store = null
      const containersBills = new Bills ({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      })
      const handleClickNewBill = jest.fn((e) => containersBills.handleClickNewBill(e))
      btnNewBill.addEventListener('click', handleClickNewBill)
      userEvent.click(btnNewBill);
      expect(handleClickNewBill).toHaveBeenCalled()
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    })
  })

  describe("When I click on the icon eye", () => {
    test("Then a modal should open", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = BillsUI({ data: bills })
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      const iconEye = screen.getAllByTestId("icon-eye");

      const store = null
      const containersBills = new Bills ({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      })
      $.fn.modal = jest.fn();
      const handleClickIconEye = jest.fn(containersBills.handleClickIconEye(iconEye[0]))
      iconEye[0].addEventListener("click", handleClickIconEye)
      userEvent.click(iconEye[0])
      expect(handleClickIconEye).toHaveBeenCalled()
      expect($.fn.modal).toBeTruthy()
    })
  })
})

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bill", () => {
    test("Then fetches bills from mock API GET", async () => {

      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      const store = mockStore
      const containersBills = new Bills ({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      })
      
      const spyGetList = jest.spyOn(containersBills, 'getBills')
      const data = await containersBills.getBills()
      const lengthData = data.length
      
      expect(spyGetList).toHaveBeenCalledTimes(1)
      expect(lengthData).toBe(4)

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
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(window,'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("Then there is a error 404", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("Then there is a error 500", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})
